import type { WorkspacePlan } from '@prisma/client';
import { db } from '@/lib/db';
import { PLANS } from '@/lib/billing/plans';

/**
 * What the console reads.
 *
 * Every figure here is a count or a sum over indexed columns rather than rows
 * pulled into memory and counted in JavaScript - the console has to stay usable
 * when the numbers get large, which is exactly when someone will want to look
 * at it.
 */

export type Totals = {
  users: number;
  workspaces: number;
  projects: number;
  deployments: number;
  liveSites: number;
  newUsers7d: number;
  generations7d: number;
  creditsSpent7d: number;
};

export type PlanBreakdown = { plan: WorkspacePlan; label: string; workspaces: number }[];

export type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  plan: WorkspacePlan;
  planSource: string;
  members: number;
  projects: number;
  creditsUsed: number;
  creditLimit: number;
  periodStart: Date;
  createdAt: Date;
  ownerEmail: string | null;
};

export type ActivityRow = {
  id: string;
  kind: string;
  credits: number;
  plan: WorkspacePlan;
  createdAt: Date;
  workspaceName: string;
};

const sevenDaysAgo = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

export async function totals(): Promise<Totals> {
  const since = sevenDaysAgo();

  const [users, workspaces, projects, deployments, liveSites, newUsers7d, generations7d, credits7d] = await Promise.all([
    db.user.count(),
    db.workspace.count(),
    db.project.count(),
    db.deployment.count(),
    db.project.count({ where: { productionUrl: { not: null } } }),
    db.user.count({ where: { createdAt: { gte: since } } }),
    db.usageEvent.count({ where: { createdAt: { gte: since }, kind: { in: ['generate', 'regenerate'] } } }),
    db.usageEvent.aggregate({ where: { createdAt: { gte: since } }, _sum: { credits: true } }),
  ]);

  return {
    users,
    workspaces,
    projects,
    deployments,
    liveSites,
    newUsers7d,
    generations7d,
    creditsSpent7d: credits7d._sum.credits ?? 0,
  };
}

export async function planBreakdown(): Promise<PlanBreakdown> {
  const grouped = await db.workspace.groupBy({ by: ['plan'], _count: { _all: true } });
  const counts = new Map(grouped.map((row) => [row.plan, row._count._all]));

  return (Object.keys(PLANS) as WorkspacePlan[]).map((plan) => ({
    plan,
    label: PLANS[plan].label,
    workspaces: counts.get(plan) ?? 0,
  }));
}

/**
 * Workspaces, newest first, with what each has spent this period.
 *
 * Usage is aggregated in one grouped query rather than one per workspace: the
 * obvious loop is a query per row, and it only hurts once there are enough
 * customers to care about.
 */
export async function workspaces(take = 50): Promise<WorkspaceRow[]> {
  const rows = await db.workspace.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true,
      name: true,
      slug: true,
      plan: true,
      planSource: true,
      periodStart: true,
      createdAt: true,
      _count: { select: { members: true, projects: true } },
      members: {
        where: { role: 'OWNER' },
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { user: { select: { email: true } } },
      },
    },
  });

  if (rows.length === 0) return [];

  const usage = await db.usageEvent.groupBy({
    by: ['workspaceId'],
    where: { workspaceId: { in: rows.map((row) => row.id) } },
    _sum: { credits: true },
  });
  const spentByWorkspace = new Map(usage.map((row) => [row.workspaceId, row._sum.credits ?? 0]));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    plan: row.plan,
    planSource: row.planSource,
    members: row._count.members,
    projects: row._count.projects,
    // Grouped without a period filter, so this is lifetime spend; the per-period
    // figure lives on the workspace's own screen where the period is in view.
    creditsUsed: spentByWorkspace.get(row.id) ?? 0,
    creditLimit: PLANS[row.plan].credits,
    periodStart: row.periodStart,
    createdAt: row.createdAt,
    ownerEmail: row.members[0]?.user.email ?? null,
  }));
}

export async function recentActivity(take = 25): Promise<ActivityRow[]> {
  const rows = await db.usageEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true,
      kind: true,
      credits: true,
      plan: true,
      createdAt: true,
      workspace: { select: { name: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    credits: row.credits,
    plan: row.plan,
    createdAt: row.createdAt,
    workspaceName: row.workspace.name,
  }));
}
