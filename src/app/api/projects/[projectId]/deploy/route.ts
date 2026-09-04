import { NextResponse } from 'next/server';
import { handle } from '@/lib/api';
import { requireProjectRef, requireUser } from '@/lib/tenancy';
import { deploymentHistory, isVercelConfigured, latestDeployment, previewDeploymentFiles, refreshDeployment, startDeployment } from '@/lib/deploy/service';
import { checkToken } from '@/lib/deploy/vercel';
import { connectionStatus, resolveCredentials } from '@/lib/deploy/credentials';

export const runtime = 'nodejs';
export const maxDuration = 60;

type Params = { params: Promise<{ projectId: string }> };

/** Deployment state for the editor's deploy panel. Refreshes a live build. */
export const GET = handle(async (_request: Request, { params }: Params) => {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await requireProjectRef(projectId, user.id);

  const latest = await latestDeployment(projectId);
  const refreshed = latest && (latest.status === 'QUEUED' || latest.status === 'BUILDING') ? await refreshDeployment(latest.id) : latest;

  // The token check runs alongside the rest so the panel can warn about a
  // restricted token before anyone watches a deployment fail.
  const resolved = await resolveCredentials(project.workspaceId);

  const [history, files, token, connection] = await Promise.all([
    deploymentHistory(projectId),
    previewDeploymentFiles(projectId),
    checkToken(resolved?.credentials ?? null),
    connectionStatus(project.workspaceId),
  ]);

  return NextResponse.json({
    // Deployable at all - either the workspace connected an account, or the
    // platform has a fallback token configured.
    configured: Boolean(resolved),
    platformFallback: isVercelConfigured(),
    connection,
    token,
    deployment: refreshed,
    history,
    files,
  });
});

export const POST = handle(async (_request: Request, { params }: Params) => {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await requireProjectRef(projectId, user.id);

  const resolved = await resolveCredentials(project.workspaceId);
  if (!resolved) {
    return NextResponse.json(
      { error: 'No Vercel account is connected. Connect your Vercel account to deploy this site.' },
      { status: 400 },
    );
  }

  const deployment = await startDeployment(projectId, user.id);
  return NextResponse.json({ deployment }, { status: 202 });
});
