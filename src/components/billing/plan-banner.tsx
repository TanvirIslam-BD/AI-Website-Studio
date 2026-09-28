'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Megaphone, Sparkles } from 'lucide-react';
import type { WorkspacePlan } from '@prisma/client';
import type { PlanLimits } from '@/lib/billing/plans';

/**
 * What the plan allows, on the dashboard.
 *
 * States the limits before they are hit rather than only when something is
 * refused. A free account that discovers it cannot edit only at the moment it
 * tries to edit has been misled by the interface, however correct the server
 * was to refuse.
 */

type PlanState = {
  plan: WorkspacePlan;
  limits: PlanLimits;
  websites: { used: number; limit: number; remaining: number };
  credits: { used: number; limit: number; remaining: number };
  periodEnd: string;
  canEdit: boolean;
  canDeploy: boolean;
  /** Set by the operator from the console; absent almost all of the time. */
  notice: string | null;
  generationPaused: boolean;
};

export function PlanBanner() {
  const [state, setState] = useState<PlanState | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch('/api/workspace/plan', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as PlanState;
        if (!cancelled) setState(payload);
      } catch {
        // The banner is informational; failing to load it should not be noise.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!state) return null;

  const paid = state.plan !== 'FREE';
  const websitesLeft = state.websites.remaining;
  const creditsLeft = state.credits.remaining;
  const creditsLow = creditsLeft <= state.credits.limit / 10;
  const blocked = [!state.canEdit ? 'editing' : null, !state.canDeploy ? 'publishing' : null].filter(Boolean);

  return (
    <div className="grid gap-2">
      {/*
        Anything the operator has said, and the pause if one is on. Above the
        plan row because it explains failures the plan does not: someone whose
        generation is refused during a pause should not be reading an upgrade
        prompt for it.
      */}
      {state.notice ? (
        <p className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[12px] text-white/75">
          <Megaphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
          {state.notice}
        </p>
      ) : null}

      {state.generationPaused ? (
        <p className="rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-[12px] text-amber-100">
          Website generation is paused right now. Editing and publishing still work.
        </p>
      ) : null}

      <div className="grid items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] sm:gap-6">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-white">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/[0.06]">
            <Sparkles className="h-3.5 w-3.5 text-sky-200" />
          </span>
          {state.limits.label} plan
        </span>

        <Meter
          label="Websites"
          value={
            websitesLeft > 0
              ? `${websitesLeft} of ${state.websites.limit} left`
              : `${state.websites.limit} of ${state.websites.limit} used`
          }
          used={state.websites.used}
          limit={state.websites.limit}
        />

        {/*
          The reset date appears once credits are actually short. Before that it
          is noise; at that point it is the difference between "upgrade" and
          "wait until Tuesday", and only one of those costs money.
        */}
        <Meter
          label="Credits"
          value={`${creditsLeft} of ${state.credits.limit} left${
            creditsLow ? ` · resets ${new Date(state.periodEnd).toLocaleDateString()}` : ''
          }`}
          used={state.credits.used}
          limit={state.credits.limit}
        />

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          {blocked.length > 0 ? (
            <span className="text-[12px] text-white/50">{blocked.join(' and ')} needs an upgrade</span>
          ) : null}
          <Link
            href="/pricing"
            className={`focus-ring inline-flex h-8 items-center rounded-lg px-3 text-[12px] font-medium transition-colors ${
              paid
                ? 'border border-white/15 text-white/80 hover:border-white/30 hover:text-white'
                : 'bg-white text-[#07070a] hover:bg-white/90'
            }`}
          >
            {paid ? 'Manage plan' : 'Upgrade'}
          </Link>
        </div>
      </div>
    </div>
  );
}

/** A usage bar. It warms as the allowance runs out, so the state reads at a glance. */
function Meter({ label, value, used, limit }: { label: string; value: string; used: number; limit: number }) {
  const ratio = limit > 0 ? Math.min(1, Math.max(0, used / limit)) : 0;
  const tone = ratio >= 0.9 ? 'from-rose-400 to-amber-300' : ratio >= 0.7 ? 'from-amber-300 to-yellow-200' : 'from-indigo-400 to-sky-300';

  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-3 text-[12px]">
        <span className="text-white/45">{label}</span>
        <span className="truncate tabular-nums text-white/80">{value}</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={used}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone} transition-[width] duration-700`}
          style={{ width: `${Math.max(ratio * 100, used > 0 ? 3 : 0)}%` }}
        />
      </div>
    </div>
  );
}
