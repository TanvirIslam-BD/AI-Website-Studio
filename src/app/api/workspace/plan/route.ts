import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handle, readJson } from '@/lib/api';
import { requireUser, requireWorkspace } from '@/lib/tenancy';
import { entitlementsFor } from '@/lib/billing/entitlements';
import { PLANS } from '@/lib/billing/plans';
import { platformSettings } from '@/lib/platform/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** What the workspace's plan allows, and what it has spent. */
export const GET = handle(async () => {
  const user = await requireUser();
  const workspace = await requireWorkspace(user.id);
  const [entitlements, settings] = await Promise.all([entitlementsFor(workspace.id), platformSettings()]);

  return NextResponse.json({
    plan: entitlements.plan,
    limits: entitlements.limits,
    websites: entitlements.websites,
    credits: entitlements.credits,
    periodStart: entitlements.periodStart,
    canEdit: entitlements.canEdit,
    canDeploy: entitlements.canDeploy,
    catalogue: PLANS,
    // The operator's notice rides along with the plan rather than costing the
    // dashboard a second request, since both are read on the same render.
    notice: settings.notice,
    generationPaused: settings.generationPaused,
  });
});

const upgradeSchema = z.object({ plan: z.enum(['PRO', 'AGENCY']) });

/**
 * Upgrading.
 *
 * This is the seam a payment provider drops into: today it records the intent
 * and returns what the caller should do next, rather than pretending to take
 * money. A fake checkout that silently granted a paid plan would be a worse
 * outcome than an honest "not connected yet" - it would put unpaid workspaces
 * on paid plans with no record of why.
 */
export const POST = handle(async (request: Request) => {
  const user = await requireUser();
  const workspace = await requireWorkspace(user.id);
  const input = upgradeSchema.parse(await readJson(request));

  const checkoutConfigured = Boolean(process.env.BILLING_PROVIDER?.trim());
  if (!checkoutConfigured) {
    return NextResponse.json(
      {
        status: 'unavailable',
        plan: input.plan,
        price: PLANS[input.plan].price,
        message:
          'Checkout is not connected on this deployment yet. Ask the operator to enable your plan, or set BILLING_PROVIDER to wire up payments.',
      },
      { status: 501 },
    );
  }

  // A provider is configured but no integration exists yet. Refusing loudly is
  // the point: the alternative is a route that appears to work and does not.
  await db.workspace.findUniqueOrThrow({ where: { id: workspace.id }, select: { id: true } });
  return NextResponse.json(
    {
      status: 'unimplemented',
      message: `BILLING_PROVIDER is set to "${process.env.BILLING_PROVIDER}" but no checkout is implemented for it.`,
    },
    { status: 501 },
  );
});
