import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handle, readJson } from '@/lib/api';
import { requireOwner } from '@/lib/platform/owner';
import { workspaces } from '@/lib/platform/overview';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  await requireOwner();
  return NextResponse.json({ workspaces: await workspaces(100) });
});

const planSchema = z.object({
  workspaceId: z.string().min(1),
  plan: z.enum(['FREE', 'PRO', 'AGENCY']),
  /** Optional: start the credit period again, e.g. when granting a plan. */
  resetPeriod: z.boolean().default(true),
});

/**
 * Changes a workspace's plan.
 *
 * This is the seam a payment provider would eventually drive. Until one is
 * wired up it is the owner granting a plan by hand, which is recorded as such
 * in `planSource` so a granted plan is never mistaken for a paid one.
 */
export const PATCH = handle(async (request: Request) => {
  await requireOwner();
  const input = planSchema.parse(await readJson(request));

  const workspace = await db.workspace.update({
    where: { id: input.workspaceId },
    data: {
      plan: input.plan,
      planSource: 'granted',
      // Starting the period again gives the new plan its full allowance
      // immediately, which is what someone who has just been upgraded expects.
      ...(input.resetPeriod ? { periodStart: new Date() } : {}),
    },
    select: { id: true, name: true, plan: true, planSource: true, periodStart: true },
  });

  return NextResponse.json({ workspace });
});
