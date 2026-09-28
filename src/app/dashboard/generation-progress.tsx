'use client';

import { useEffect, useRef } from 'react';
import { Check, Loader2 } from 'lucide-react';
import type { GenerationProgress } from '@/lib/ai/progress';
import { describeProgress } from '@/lib/ai/progress';

/**
 * What the model is building, while it builds it.
 *
 * Every line here corresponds to something that actually arrived in the
 * response - a page that now exists, a section that has been written. Nothing
 * is on a timer, so the list stops moving exactly when the model does, which is
 * the honest thing for it to do. A percentage would have to be invented: the
 * number of sections is not known until the model has finished choosing them.
 */
export function GenerationProgressList({ events }: { events: GenerationProgress[] }) {
  const endRef = useRef<HTMLLIElement | null>(null);

  // Follow the newest line, since the list outgrows its box on a real brief.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [events.length]);

  if (events.length === 0) return null;

  const steps = collapse(events);

  const done = steps.length - 1;

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      {/*
        An indeterminate bar, not a percentage: the number of sections is not
        known until the model has chosen them, so any figure would be invented.
      */}
      <div className="relative h-0.5 overflow-hidden bg-white/[0.06]" aria-hidden>
        <div className="progress-sweep absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
      </div>
      <div className="flex items-center justify-between px-4 pt-3 text-[11px] text-white/40">
        <span className="font-medium uppercase tracking-[0.14em]">Building</span>
        <span className="tabular-nums">
          {done} step{done === 1 ? '' : 's'} done
        </span>
      </div>
      <ul className="studio-scroll max-h-44 space-y-2 overflow-y-auto px-4 pb-3.5 pt-2.5" aria-live="polite">
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          return (
            <li
              key={`${step.key}-${index}`}
              ref={last ? endRef : null}
              className="flex animate-fade-in items-center gap-2.5 text-[13px] leading-snug"
            >
              {last ? (
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-sky-400/15">
                  <Loader2 className="h-3 w-3 animate-spin text-sky-300" />
                </span>
              ) : (
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-400/15">
                  <Check className="h-2.5 w-2.5 text-emerald-300" strokeWidth={3} />
                </span>
              )}
              <span className={last ? 'font-medium text-white' : 'text-white/50'}>{step.label}</span>
              {step.count > 1 ? <span className="text-white/30">×{step.count}</span> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type Step = { key: string; label: string; count: number };

/**
 * Fourteen "writing the features section" lines in a row is noise, not
 * progress. Identical consecutive steps become one line with a count.
 */
function collapse(events: GenerationProgress[]): Step[] {
  const steps: Step[] = [];

  for (const event of events) {
    const label = describeProgress(event);
    const previous = steps[steps.length - 1];
    if (previous && previous.label === label) {
      previous.count += 1;
      continue;
    }
    steps.push({ key: event.stage, label, count: 1 });
  }

  return steps;
}
