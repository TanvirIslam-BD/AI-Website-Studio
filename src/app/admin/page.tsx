import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Activity, Boxes, Globe2, Rocket, Users } from 'lucide-react';
import { currentOwner, isOwnerConfigured } from '@/lib/platform/owner';
import { platformSettings } from '@/lib/platform/settings';
import { planBreakdown, recentActivity, totals, workspaces } from '@/lib/platform/overview';
import { aiStatus } from '@/lib/ai';
import { formatRelative } from '@/lib/utils';
import { GenerationControls } from './generation-controls';
import { WorkspaceTable } from './workspace-table';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Owner console',
  robots: { index: false, follow: false },
};

/**
 * The owner console.
 *
 * `notFound()` rather than a redirect to sign-in: someone who is not an owner
 * should not learn that this address means anything. The API routes behind it
 * make the same check for themselves, because a guard on the page alone would
 * leave the data one fetch away.
 */
export default async function AdminPage() {
  const owner = await currentOwner();
  if (!owner) notFound();

  const [counts, plans, settings, rows, activity] = await Promise.all([
    totals(),
    planBreakdown(),
    platformSettings(),
    workspaces(50),
    recentActivity(20),
  ]);
  const ai = aiStatus();

  const cards = [
    { icon: Users, label: 'Users', value: counts.users, sub: `${counts.newUsers7d} in the last 7 days` },
    { icon: Boxes, label: 'Workspaces', value: counts.workspaces, sub: `${counts.projects} websites` },
    { icon: Activity, label: 'Generations', value: counts.generations7d, sub: 'last 7 days' },
    { icon: Rocket, label: 'Deployments', value: counts.deployments, sub: `${counts.liveSites} sites live` },
  ];

  return (
    <main className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <h1 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-900">Owner console</h1>
            <p className="text-[12px] text-ink-500">Signed in as {owner.email}</p>
          </div>
          <span className="rounded-full border border-ink-200 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">
            {process.env.NODE_ENV}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl border border-ink-200 bg-white p-4">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                <card.icon className="h-3.5 w-3.5" /> {card.label}
              </p>
              <p className="mt-2 text-[26px] font-semibold tabular-nums tracking-[-0.02em] text-ink-950">
                {card.value.toLocaleString()}
              </p>
              <p className="text-[12px] text-ink-500">{card.sub}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <h2 className="text-[13px] font-semibold text-ink-900">Generation</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
              Forcing templates stops every AI call across the product, and takes effect on the next request - no
              redeploy. Provider keys stay as they are.
            </p>
            <div className="mt-3">
              <GenerationControls
                initial={settings}
                provider={ai.configured ? `${ai.label} · ${ai.model}` : 'no key configured'}
              />
            </div>
          </div>

          <div>
            <h2 className="text-[13px] font-semibold text-ink-900">Plans</h2>
            <ul className="mt-3 divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-200 bg-white">
              {plans.map((row) => (
                <li key={row.plan} className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-[13px] text-ink-800">{row.label}</span>
                  <span className="font-mono text-[13px] tabular-nums text-ink-900">{row.workspaces}</span>
                </li>
              ))}
              <li className="flex items-center justify-between bg-ink-50/60 px-3.5 py-2.5">
                <span className="text-[12px] text-ink-500">Credits spent, 7 days</span>
                <span className="font-mono text-[13px] tabular-nums text-ink-900">{counts.creditsSpent7d}</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[13px] font-semibold text-ink-900">Workspaces</h2>
          <p className="mt-1 text-[12px] text-ink-500">
            Changing a plan here records it as granted, so it is never mistaken for a paid subscription.
          </p>
          <div className="mt-3">
            <WorkspaceTable initial={rows} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[13px] font-semibold text-ink-900">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="mt-3 rounded-xl border border-ink-200 bg-white px-3.5 py-6 text-center text-[13px] text-ink-500">
              Nothing recorded yet.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-200 bg-white">
              {activity.map((row) => (
                <li key={row.id} className="flex items-center gap-3 px-3.5 py-2.5 text-[13px]">
                  <span className="w-24 shrink-0 font-mono text-[11px] uppercase tracking-wide text-ink-500">
                    {row.kind}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink-800">{row.workspaceName}</span>
                  <span className="shrink-0 font-mono text-[11px] text-ink-400">
                    {row.credits > 0 ? `-${row.credits}` : '—'}
                  </span>
                  <span className="w-20 shrink-0 text-right text-[11px] text-ink-400">
                    {formatRelative(row.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {!isOwnerConfigured() ? (
          <p className="mt-10 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[12px] text-amber-900">
            No OWNER_EMAILS is set, so nobody can reach this console in production.
          </p>
        ) : null}

        <section className="mt-10 flex items-center gap-2 text-[12px] text-ink-400">
          <Globe2 className="h-3.5 w-3.5" />
          Health, configuration and database state are at <code className="text-ink-600">/api/health</code>.
        </section>
      </div>
    </main>
  );
}
