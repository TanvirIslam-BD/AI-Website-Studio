import type { Prisma, WorkspacePlan } from '@prisma/client';
import { db } from '@/lib/db';
import { COST, FREE_KINDS, PLANS, cheapestPlanWith, type ChargeableAction, type PlanLimits, type UsageKind } from './plans';

/**
 * What a workspace is currently allowed to do, and the recording of it.
 *
 * One module, because the check and the charge have to agree. Splitting them
 * invites a route that checks one thing and spends another, and the failure
 * mode is silent: someone gets work for free, or is billed for work that never
 * happened.
 *
 * Every mutating route asks `requireAllowance` before doing the work and calls
 * `recordUsage` after it succeeds. In that order deliberately - a generation
 * that fails should not cost a credit, and a user who has been refused should
 * never have been charged to find out.
 */

export class PlanLimitError extends Error {
  /**
   * 402 rather than 403. The request was understood and the caller is who they
   * say they are; what is missing is payment. That distinction is the whole
   * point of the status code, and the client keys its upgrade prompt off it.
   */
  readonly status = 402;

  constructor(
    message: string,
    /** The cheapest plan that would allow this, for the upgrade prompt. */
    readonly requiredPlan: WorkspacePlan,
    /** Which limit was hit, so the interface can say something specific. */
    readonly reason: 'websites' | 'credits' | 'editing' | 'deploying' | 'paused',
  ) {
    super(message);
    this.name = 'PlanLimitError';
  }
}

export type Entitlements = {
  plan: WorkspacePlan;
  limits: PlanLimits;
  websites: { used: number; limit: number; remaining: number };
  credits: { used: number; limit: number; remaining: number };
  periodStart: Date;
  canEdit: boolean;
  canDeploy: boolean;
};

/**
 * Reads what a workspace has spent this period.
 *
 * Summed from the ledger rather than read from a counter, so it cannot drift
 * from the record of what actually happened. The index on
 * `(workspaceId, createdAt)` is what keeps this cheap.
 */
export async function entitlementsFor(workspaceId: string): Promise<Entitlements> {
  const workspace = await db.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    select: { plan: true, periodStart: true },
  });

  const limits = PLANS[workspace.plan];

  const [websites, spent] = await Promise.all([
    db.project.count({ where: { workspaceId } }),
    db.usageEvent.aggregate({
      where: { workspaceId, createdAt: { gte: workspace.periodStart } },
      _sum: { credits: true },
    }),
  ]);

  const used = spent._sum.credits ?? 0;

  return {
    plan: workspace.plan,
    limits,
    websites: { used: websites, limit: limits.websites, remaining: Math.max(0, limits.websites - websites) },
    credits: { used, limit: limits.credits, remaining: Math.max(0, limits.credits - used) },
    periodStart: workspace.periodStart,
    canEdit: limits.canEdit,
    canDeploy: limits.canDeploy,
  };
}

/** Platform-wide pause, checked before anything is spent. */
async function generationPaused(): Promise<boolean> {
  const setting = await db.platformSetting.findUnique({
    where: { id: 'singleton' },
    select: { generationPaused: true },
  });
  return setting?.generationPaused ?? false;
}

/**
 * Throws unless the workspace may perform `action` right now.
 *
 * Called before the work, never after. A refusal must cost the caller nothing
 * beyond the round trip.
 */
export async function requireAllowance(
  workspaceId: string,
  action: 'generate' | 'regenerate' | 'copilot' | 'deploy' | 'edit' | 'createProject',
): Promise<Entitlements> {
  const entitlements = await entitlementsFor(workspaceId);

  if (action === 'generate' || action === 'regenerate' || action === 'copilot') {
    if (await generationPaused()) {
      throw new PlanLimitError(
        'Generation is paused right now. It will be back shortly.',
        entitlements.plan,
        'paused',
      );
    }
  }

  switch (action) {
    case 'createProject':
    case 'generate': {
      if (entitlements.websites.remaining <= 0) {
        throw new PlanLimitError(
          `Your ${entitlements.limits.label} plan includes ${entitlements.websites.limit} website${entitlements.websites.limit === 1 ? '' : 's'}. Upgrade to build more.`,
          cheapestPlanWith((limits) => limits.websites > entitlements.websites.limit),
          'websites',
        );
      }
      requireCredits(entitlements, 'generate');
      return entitlements;
    }

    case 'regenerate':
    case 'copilot': {
      requireEditing(entitlements);
      requireCredits(entitlements, action);
      return entitlements;
    }

    case 'edit': {
      requireEditing(entitlements);
      return entitlements;
    }

    case 'deploy': {
      if (!entitlements.canDeploy) {
        throw new PlanLimitError(
          `Publishing is not included in the ${entitlements.limits.label} plan. Upgrade to put this website online.`,
          cheapestPlanWith((limits) => limits.canDeploy),
          'deploying',
        );
      }
      return entitlements;
    }
  }
}

function requireEditing(entitlements: Entitlements): void {
  if (entitlements.canEdit) return;
  throw new PlanLimitError(
    `The ${entitlements.limits.label} plan includes one generated website to look at. Upgrade to change it.`,
    cheapestPlanWith((limits) => limits.canEdit),
    'editing',
  );
}

function requireCredits(entitlements: Entitlements, action: ChargeableAction): void {
  if (entitlements.credits.remaining >= COST[action]) return;
  throw new PlanLimitError(
    `You have used all ${entitlements.credits.limit} credits in this period. Upgrade for more.`,
    cheapestPlanWith((limits) => limits.credits > entitlements.credits.limit),
    'credits',
  );
}

/**
 * Records that something happened, after it has succeeded.
 *
 * Free actions are recorded too, with zero credits: the ledger is the activity
 * history the owner console reads, and a deployment that cost nothing is still
 * something worth being able to see.
 */
export async function recordUsage(input: {
  workspaceId: string;
  plan: WorkspacePlan;
  kind: UsageKind;
  userId?: string | null;
  projectId?: string | null;
}): Promise<void> {
  const credits = (FREE_KINDS as readonly string[]).includes(input.kind) ? 0 : COST[input.kind as ChargeableAction];

  const data: Prisma.UsageEventUncheckedCreateInput = {
    workspaceId: input.workspaceId,
    userId: input.userId ?? null,
    projectId: input.projectId ?? null,
    kind: input.kind,
    credits,
    plan: input.plan,
  };

  try {
    await db.usageEvent.create({ data });
  } catch (error) {
    // Never fail a request the user has already paid for because the ledger
    // write failed. The work is done; losing the record is the lesser harm, and
    // it goes to the log so it is not lost silently.
    console.error('[billing] could not record usage', error);
  }
}
