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

  return (
    <div className="grid gap-2">
      {/*
        Anything the operator has said, and the pause if one is on. Above the
        plan row because it explains failures the plan does not: someone whose
        generation is refused during a pause should not be reading an upgrade
        prompt for it.
      */}
      {state.notice ? (
        <p className="flex items-start gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-[12px] text-ink-700">
          <Megaphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
          {state.notice}
        </p>
      ) : null}

      {state.generationPaused ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12px] text-amber-900">
          Website generation is paused right now. Editing and publishing still work.
        </p>
      ) : null}

      <div
        className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border px-3.5 py-2.5 text-[12px] ${
          paid ? 'border-ink-200 bg-white' : 'border-ink-300 bg-ink-950 text-white'
        }`}
      >
        <span className="flex items-center gap-1.5 font-semibold">
          <Sparkles className={`h-3.5 w-3.5 ${paid ? 'text-ink-500' : 'text-white/70'}`} />
          {state.limits.label} plan
        </span>

        <span className={paid ? 'text-ink-600' : 'text-white/75'}>
          {websitesLeft > 0
            ? `${websitesLeft} of ${state.websites.limit} website${state.websites.limit === 1 ? '' : 's'} left`
            : `${state.websites.limit} website${state.websites.limit === 1 ? '' : 's'} used`}
        </span>

        {/*
          The reset date appears once credits are actually short. Before that it
          is noise; at that point it is the difference between "upgrade" and
          "wait until Tuesday", and only one of those costs money.
        */}
        <span className={paid ? 'text-ink-600' : 'text-white/75'}>
          {creditsLeft} of {state.credits.limit} credits
          {creditsLeft <= state.credits.limit / 10 ? (
            <span className={paid ? 'text-ink-400' : 'text-white/50'}>
              {' '}
              · resets {new Date(state.periodEnd).toLocaleDateString()}
            </span>
          ) : null}
        </span>

        {!state.canEdit || !state.canDeploy ? (
          <span className={paid ? 'text-ink-500' : 'text-white/60'}>
            {[!state.canEdit ? 'editing' : null, !state.canDeploy ? 'publishing' : null]
              .filter(Boolean)
              .join(' and ')}{' '}
            needs an upgrade
          </span>
        ) : null}

        <Link
          href="/pricing"
          className={`focus-ring ml-auto rounded-md px-2.5 py-1 font-medium transition-colors ${
            paid ? 'text-ink-700 hover:text-ink-950' : 'bg-white text-ink-950 hover:bg-white/90'
          }`}
        >
          {paid ? 'Manage plan' : 'Upgrade'}
        </Link>
      </div>
    </div>
  );
}
