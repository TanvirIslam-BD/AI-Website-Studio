import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle } from '@/lib/api';
import { ForbiddenError, requireUser } from '@/lib/tenancy';
import { refreshDeployment } from '@/lib/deploy/service';

export const runtime = 'nodejs';

/** Polled by the deploy panel while a build is running. */
export const GET = handle(async (_request: Request, { params }: { params: Promise<{ deploymentId: string }> }) => {
  const { deploymentId } = await params;
  const user = await requireUser();

  const owned = await db.deployment.findFirst({
    where: { id: deploymentId, project: { workspace: { members: { some: { userId: user.id } } } } },
    select: { id: true },
  });
  if (!owned) throw new ForbiddenError('Deployment not found.');

  return NextResponse.json({ deployment: await refreshDeployment(deploymentId) });
});
