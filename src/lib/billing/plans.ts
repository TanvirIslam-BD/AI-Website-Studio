import type { WorkspacePlan } from '@prisma/client';

/**
 * What each plan allows.
 *
 * Deliberately code rather than database rows. These are product decisions -
 * changing what a free account can do is a change to the product, and it should
 * go through review, ship with a version, and be revertable. A settings table
 * would make it a thing anyone with database access could quietly alter, with
 * no record of what the limits were when a given account signed up.
 *
 * Everything here is enforced on the server, at every route that can spend it.
 * The interface reads the same numbers to decide what to show, but the interface
 * is never what stops anything.
 */

export type PlanLimits = {
  label: string;
  /** Monthly price in whole currency units. Zero on the free plan. */
  price: number;
  /** Websites the workspace may hold at once. */
  websites: number;
  /** Credits per period. Generation and AI edits spend these. */
  credits: number;
  /** Publishing to a hosting account at all. */
  canDeploy: boolean;
  /**
   * Changing a website after it exists - by hand or through the copilot.
   *
   * False on the free plan by design: a free account is a complete sample of
   * the output, not a workspace to work in.
   */
  canEdit: boolean;
  /** Shown on the pricing table and the upgrade prompts. */
  highlights: string[];
};

export const PLANS: Record<WorkspacePlan, PlanLimits> = {
  FREE: {
    label: 'Free',
    price: 0,
    websites: 1,
    // Exactly one generation. The point of the free plan is to show what the
    // product produces, and one website does that.
    credits: 1,
    canDeploy: false,
    canEdit: false,
    highlights: ['One generated website', 'Full preview of the result', 'Upgrade to edit or publish'],
  },
  PRO: {
    label: 'Pro',
    price: 19,
    websites: 25,
    credits: 300,
    canDeploy: true,
    canEdit: true,
    highlights: ['25 websites', '300 AI credits a month', 'Publish to your own Vercel account', 'Visual and AI editing'],
  },
  AGENCY: {
    label: 'Agency',
    price: 79,
    websites: 250,
    credits: 2000,
    canDeploy: true,
    canEdit: true,
    highlights: ['250 websites', '2,000 AI credits a month', 'Everything in Pro', 'For teams building for clients'],
  },
};

/** What each chargeable action costs. */
export const COST = {
  /** A whole website: the most expensive thing the product does. */
  generate: 1,
  /** Rebuilding an existing website from a new brief. */
  regenerate: 1,
  /** One copilot instruction, however many operations it applies. */
  copilot: 1,
} as const;

export type ChargeableAction = keyof typeof COST;

/**
 * Every action the ledger records.
 *
 * Wider than the chargeable set on purpose: a deployment and a blank scaffold
 * cost nothing, but they are activity, and the console's job is to show what is
 * happening rather than only what is being billed.
 */
export type UsageKind = ChargeableAction | 'deploy' | 'scaffold';

/** The kinds that cost nothing, kept beside the costs so the two cannot drift. */
export const FREE_KINDS = ['deploy', 'scaffold'] as const;

export const PLAN_ORDER: WorkspacePlan[] = ['FREE', 'PRO', 'AGENCY'];

/** True when `to` is a step up from `from`, for wording upgrade prompts. */
export function isUpgrade(from: WorkspacePlan, to: WorkspacePlan): boolean {
  return PLAN_ORDER.indexOf(to) > PLAN_ORDER.indexOf(from);
}

/** The cheapest plan that permits something, for pointing an upgrade at. */
export function cheapestPlanWith(predicate: (limits: PlanLimits) => boolean): WorkspacePlan {
  return PLAN_ORDER.find((plan) => predicate(PLANS[plan])) ?? 'PRO';
}
