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

  return (
    <div className="mt-4 rounded-xl border border-ink-200 bg-ink-50/60 p-3">
      <ul className="studio-scroll max-h-40 space-y-1.5 overflow-y-auto pr-1">
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          return (
            <li
              key={`${step.key}-${index}`}
              ref={last ? endRef : null}
              className="flex items-center gap-2 text-[12px] leading-snug"
            >
              {last ? (
                <Loader2 className="h-3 w-3 shrink-0 animate-spin text-brand-600" />
              ) : (
                <Check className="h-3 w-3 shrink-0 text-emerald-600" />
              )}
              <span className={last ? 'font-medium text-ink-900' : 'text-ink-500'}>{step.label}</span>
              {step.count > 1 ? <span className="text-ink-400">×{step.count}</span> : null}
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
