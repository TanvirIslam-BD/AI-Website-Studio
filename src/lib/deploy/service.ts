import { db } from '@/lib/db';
import { loadDocument } from '@/lib/website/persistence';
import { generateProductionFiles, totalBytes } from './codegen';
import { createDeployment, getDeployment, isVercelConfigured, productionUrlFor, vercelProjectName, VercelError, type VercelReadyState } from './vercel';
import { resolveCredentials } from './credentials';
import type { DeploymentStatus } from '@prisma/client';

/**
 * Deployment orchestration.
 *
 * Sequence: load document -> generate static files -> hand them to the host ->
 * record the deployment -> poll for build status. The studio never runs the
 * generated site's code; it only ships files, so a deployment cannot affect the
 * platform itself.
 */

const STATUS_MAP: Record<VercelReadyState, DeploymentStatus> = {
  QUEUED: 'QUEUED',
  INITIALIZING: 'BUILDING',
  BUILDING: 'BUILDING',
  READY: 'READY',
  ERROR: 'ERROR',
  CANCELED: 'CANCELED',
};

export type DeploymentView = {
  id: string;
  status: DeploymentStatus;
  url: string | null;
  inspectorUrl: string | null;
  error: string | null;
  fileCount: number | null;
  sizeKb: number | null;
  createdAt: string;
  readyAt: string | null;
};

function toView(row: {
  id: string;
  status: DeploymentStatus;
  url: string | null;
  inspectorUrl: string | null;
  error: string | null;
  meta: unknown;
  createdAt: Date;
  readyAt: Date | null;
}): DeploymentView {
  const meta = (row.meta ?? {}) as { fileCount?: number; bytes?: number };
  return {
    id: row.id,
    status: row.status,
    url: row.url,
    inspectorUrl: row.inspectorUrl,
    error: row.error,
    fileCount: meta.fileCount ?? null,
    sizeKb: meta.bytes ? Math.round(meta.bytes / 102.4) / 10 : null,
    createdAt: row.createdAt.toISOString(),
    readyAt: row.readyAt?.toISOString() ?? null,
  };
}

export { isVercelConfigured };

/** Starts a production deployment and returns the tracking row immediately. */
export async function startDeployment(projectId: string, userId: string): Promise<DeploymentView> {
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { id: true, name: true, slug: true, description: true, productionUrl: true, workspaceId: true },
  });

  // The workspace's own account, falling back to the platform's only when no
  // connection exists (self-hosting and local development).
  const resolved = await resolveCredentials(project.workspaceId);
  if (!resolved) {
    throw new Error('No Vercel account is connected. Connect one to deploy this site to your own account.');
  }

  const document = await loadDocument(projectId);
  if (document.pages.every((page) => page.sections.length === 0)) {
    throw new Error('This website has no sections yet. Generate or add content before deploying.');
  }

  const files = await generateProductionFiles(document, {
    name: project.name,
    description: project.description,
    baseUrl: project.productionUrl,
  });

  const deployment = await db.deployment.create({
    data: {
      projectId,
      createdById: userId,
      status: 'QUEUED',
      target: 'production',
      // Recording the account keeps the history honest about where a given
      // deployment actually went, which matters if a workspace reconnects to a
      // different account later.
      meta: { fileCount: files.length, bytes: totalBytes(files), account: resolved.accountName, source: resolved.source },
    },
  });

  await db.project.update({ where: { id: projectId }, data: { status: 'DEPLOYING' } });

  try {
    const created = await createDeployment({
      name: vercelProjectName(project.slug, project.id),
      files,
      credentials: resolved.credentials,
    });

    const updated = await db.deployment.update({
      where: { id: deployment.id },
      data: {
        externalId: created.id,
        status: STATUS_MAP[created.readyState],
        url: productionUrlFor(created),
        inspectorUrl: created.inspectorUrl,
      },
    });

    return toView(updated);
  } catch (error) {
    const message =
      error instanceof VercelError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Deployment failed to start.';

    const failed = await db.deployment.update({
      where: { id: deployment.id },
      data: { status: 'ERROR', error: message },
    });
    await db.project.update({ where: { id: projectId }, data: { status: 'ERROR' } });
    return toView(failed);
  }
}

/**
 * Reads a deployment, refreshing from Vercel while the build is still running.
 * The client polls this; there is no webhook to configure.
 */
export async function refreshDeployment(deploymentId: string): Promise<DeploymentView> {
  const row = await db.deployment.findUniqueOrThrow({
    where: { id: deploymentId },
    include: { project: { select: { workspaceId: true } } },
  });

  const settled = row.status === 'READY' || row.status === 'ERROR' || row.status === 'CANCELED';
  if (settled || !row.externalId) return toView(row);

  const resolved = await resolveCredentials(row.project.workspaceId);
  if (!resolved) return toView(row);

  try {
    const remote = await getDeployment(row.externalId, resolved.credentials);
    const status = STATUS_MAP[remote.readyState];
    const url = productionUrlFor(remote) ?? row.url;

    const updated = await db.deployment.update({
      where: { id: row.id },
      data: {
        status,
        url,
        inspectorUrl: remote.inspectorUrl ?? row.inspectorUrl,
        error: remote.errorMessage ?? (status === 'ERROR' ? 'The Vercel build failed.' : null),
        readyAt: status === 'READY' ? new Date() : null,
      },
    });

    if (status === 'READY' && url) {
      await db.project.update({
        where: { id: row.projectId },
        data: { status: 'DEPLOYED', productionUrl: url },
      });
    } else if (status === 'ERROR' || status === 'CANCELED') {
      await db.project.update({ where: { id: row.projectId }, data: { status: 'ERROR' } });
    }

    return toView(updated);
  } catch (error) {
    // A transient polling failure must not mark a healthy build as broken.
    if (error instanceof VercelError && error.status && error.status >= 500) return toView(row);
    const message = error instanceof Error ? error.message : 'Could not read the deployment status.';
    const updated = await db.deployment.update({ where: { id: row.id }, data: { status: 'ERROR', error: message } });
    await db.project.update({ where: { id: row.projectId }, data: { status: 'ERROR' } });
    return toView(updated);
  }
}

export async function latestDeployment(projectId: string): Promise<DeploymentView | null> {
  const row = await db.deployment.findFirst({ where: { projectId }, orderBy: { createdAt: 'desc' } });
  return row ? toView(row) : null;
}

export async function deploymentHistory(projectId: string, take = 8): Promise<DeploymentView[]> {
  const rows = await db.deployment.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' }, take });
  return rows.map(toView);
}

/** Preview of what would be shipped - powers the "files" list in the UI. */
export async function previewDeploymentFiles(projectId: string) {
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { name: true, description: true, productionUrl: true },
  });
  const document = await loadDocument(projectId);
  const files = await generateProductionFiles(document, {
    name: project.name,
    description: project.description,
    baseUrl: project.productionUrl,
  });
  return files.map((file) => ({ file: file.file, bytes: Buffer.byteLength(file.data, 'utf8') }));
}
