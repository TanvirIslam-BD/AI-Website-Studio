import { NextResponse } from 'next/server';
import { handle } from '@/lib/api';
import { requireProjectRef, requireUser } from '@/lib/tenancy';
import { deploymentHistory, isVercelConfigured, latestDeployment, previewDeploymentFiles, refreshDeployment, startDeployment } from '@/lib/deploy/service';
import { checkToken } from '@/lib/deploy/vercel';

export const runtime = 'nodejs';
export const maxDuration = 60;

type Params = { params: Promise<{ projectId: string }> };

/** Deployment state for the editor's deploy panel. Refreshes a live build. */
export const GET = handle(async (_request: Request, { params }: Params) => {
  const { projectId } = await params;
  const user = await requireUser();
  await requireProjectRef(projectId, user.id);

  const latest = await latestDeployment(projectId);
  const refreshed = latest && (latest.status === 'QUEUED' || latest.status === 'BUILDING') ? await refreshDeployment(latest.id) : latest;

  // The token check runs alongside the rest so the panel can warn about a
  // restricted token before anyone watches a deployment fail.
  const [history, files, token] = await Promise.all([
    deploymentHistory(projectId),
    previewDeploymentFiles(projectId),
    checkToken(),
  ]);

  return NextResponse.json({
    configured: isVercelConfigured(),
    token,
    deployment: refreshed,
    history,
    files,
  });
});

export const POST = handle(async (_request: Request, { params }: Params) => {
  const { projectId } = await params;
  const user = await requireUser();
  await requireProjectRef(projectId, user.id);

  if (!isVercelConfigured()) {
    return NextResponse.json(
      { error: 'Vercel is not configured. Add VERCEL_TOKEN to your environment to deploy.' },
      { status: 400 },
    );
  }

  const deployment = await startDeployment(projectId, user.id);
  return NextResponse.json({ deployment }, { status: 202 });
});
