import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Check } from 'lucide-react';
import { currentUser, requireWorkspace } from '@/lib/tenancy';
import { entitlementsFor } from '@/lib/billing/entitlements';
import { PLANS, PLAN_ORDER } from '@/lib/billing/plans';
import { UpgradeButton } from './upgrade-button';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Plans' };

/**
 * Plans, for someone already signed in.
 *
 * Separate from the marketing pricing section on the home page, which is
 * arguing to a stranger. This one is answering a specific question - what am I
 * on, what have I used, what would change - so it leads with the current plan
 * and what is left of it.
 */
export default async function PricingPage() {
  const user = await currentUser();
  if (!user) redirect('/signin?next=/pricing');

  const workspace = await requireWorkspace(user.id);
  const entitlements = await entitlementsFor(workspace.id);

  return (
    <main className="min-h-screen bg-ink-50">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <Link
          href="/dashboard"
          className="focus-ring inline-flex items-center gap-1.5 text-[13px] text-ink-500 transition-colors hover:text-ink-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </Link>

        <h1 className="mt-5 text-[28px] font-semibold tracking-[-0.02em] text-ink-950">Plans</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-600">
          You are on <strong className="font-semibold text-ink-900">{entitlements.limits.label}</strong> — using{' '}
          {entitlements.websites.used} of {entitlements.websites.limit} website
          {entitlements.websites.limit === 1 ? '' : 's'} and {entitlements.credits.used} of{' '}
          {entitlements.credits.limit} credits this period.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {PLAN_ORDER.map((plan) => {
            const limits = PLANS[plan];
            const current = plan === entitlements.plan;

            return (
              <section
                key={plan}
                className={`flex flex-col rounded-2xl border p-5 ${
                  current ? 'border-ink-900 bg-white shadow-panel' : 'border-ink-200 bg-white'
                }`}
              >
                <header className="flex items-baseline justify-between gap-2">
                  <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-950">{limits.label}</h2>
                  {current ? (
                    <span className="rounded-full bg-ink-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Current
                    </span>
                  ) : null}
                </header>

                <p className="mt-3 text-[26px] font-semibold tracking-[-0.02em] text-ink-950">
                  {limits.price === 0 ? 'Free' : `$${limits.price}`}
                  {limits.price > 0 ? <span className="text-[13px] font-normal text-ink-500"> / month</span> : null}
                </p>

                <ul className="mt-4 flex-1 space-y-2">
                  {limits.highlights.map((line) => (
                    <li key={line} className="flex gap-2 text-[13px] leading-relaxed text-ink-700">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={2.2} />
                      {line}
                    </li>
                  ))}
                </ul>

                <div className="mt-5">
                  {current ? (
                    <p className="text-center text-[12px] text-ink-400">Your current plan</p>
                  ) : plan === 'FREE' ? (
                    <p className="text-center text-[12px] text-ink-400">Downgrades are handled by the operator</p>
                  ) : (
                    <UpgradeButton plan={plan} label={`Upgrade to ${limits.label}`} />
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <p className="mt-8 text-[12px] leading-relaxed text-ink-500">
          Credits are spent by generating a website and by AI edits. They reset at the start of each period, which
          began {entitlements.periodStart.toLocaleDateString()}.
        </p>
      </div>
    </main>
  );
}
