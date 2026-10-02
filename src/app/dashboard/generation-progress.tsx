'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';
import type { GenerationProgress } from '@/lib/ai/progress';
import { sectionLabel } from '@/lib/ai/progress';
import { cn } from '@/lib/utils';

/**
 * What the model is building, while it builds it.
 *
 * Every mark here corresponds to something that actually arrived in the
 * response - a brand name, a page that now exists, a section that has been
 * written. Nothing is on a timer except the clock, which only counts real
 * seconds. There is no percentage: the number of sections is not known until
 * the model has finished choosing them, so any figure would be invented.
 *
 * Sections are grouped under the page they belong to, so a reader sees the
 * site take shape rather than a scrolling log in which the footer can appear
 * before the home page it sits on.
 */
export function GenerationPanel({ events, brief }: { events: GenerationProgress[]; brief: string }) {
  const elapsed = useElapsed();
  const model = summarise(events);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]" aria-live="polite">
      <div className="relative h-0.5 overflow-hidden bg-white/[0.06]" aria-hidden>
        <div className="progress-sweep absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">Building</p>
            <p className="mt-1 truncate text-[1.15rem] font-semibold tracking-[-0.02em] text-white">
              {model.brand ?? 'Your website'}
            </p>
          </div>
          <span className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[12px] tabular-nums text-white/70">
            {formatElapsed(elapsed)}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-white/45">&ldquo;{brief}&rdquo;</p>

        {/* --------------------------------------------------------- stepper */}
        <ol className="mt-5 grid grid-cols-5 gap-1.5" aria-label="Stages">
          {STAGES.map((stage, index) => {
            const state = index < model.stage ? 'done' : index === model.stage ? 'active' : 'todo';
            return (
              <li key={stage} className="min-w-0">
                <div
                  className={cn(
                    'h-1 rounded-full transition-colors duration-500',
                    state === 'done' && 'bg-emerald-400/80',
                    state === 'active' && 'bg-sky-300',
                    state === 'todo' && 'bg-white/10',
                  )}
                />
                <p
                  className={cn(
                    'mt-2 truncate text-[11px]',
                    state === 'todo' ? 'text-white/30' : state === 'active' ? 'font-medium text-white' : 'text-white/55',
                  )}
                >
                  {stage}
                </p>
              </li>
            );
          })}
        </ol>

        {/* --------------------------------------------------- pages, as built */}
        {model.groups.length > 0 ? (
          <ul className="studio-scroll mt-5 max-h-56 space-y-3 overflow-y-auto pr-1">
            {model.groups.map((group) => (
              <li key={group.name} className="animate-fade-in">
                <p className="text-[12px] font-medium text-white/70">{group.name}</p>
                {group.sections.length > 0 ? (
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {group.sections.map((section) => (
                      <li
                        key={section.key}
                        className={cn(
                          'inline-flex animate-fade-in items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px]',
                          section.current
                            ? 'border-sky-300/40 bg-sky-300/10 text-white'
                            : 'border-white/10 bg-white/[0.03] text-white/60',
                        )}
                      >
                        {section.current ? (
                          <Loader2 className="h-3 w-3 animate-spin text-sky-300" aria-hidden />
                        ) : (
                          <Check className="h-3 w-3 text-emerald-300" strokeWidth={3} aria-hidden />
                        )}
                        {section.label}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1.5 text-[12px] text-white/35">Planning sections…</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 flex items-center gap-2 text-[13px] text-white/55">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-300" aria-hidden />
            {model.brand ? 'Planning the pages…' : 'Reading your brief…'}
          </p>
        )}

        {model.template ? (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/25 bg-amber-400/10 px-3 py-2 text-[12px] text-amber-100">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            The AI response could not be used, so this site is being built from a starter template instead. You can
            refine it in the editor.
          </p>
        ) : null}

        <p className="mt-4 text-[12px] text-white/35">
          {model.sectionCount > 0
            ? `${model.sectionCount} section${model.sectionCount === 1 ? '' : 's'} written. `
            : ''}
          Usually 20-40 seconds. Keep this tab open - the editor opens when it&rsquo;s ready.
        </p>
      </div>
    </div>
  );
}

const STAGES = ['Brief', 'Brand', 'Pages', 'Checking', 'Saving'] as const;

type Group = { name: string; sections: Array<{ key: string; label: string; current: boolean }> };

/** Folds the event stream into what the panel shows. */
function summarise(events: GenerationProgress[]) {
  let brand: string | null = null;
  let template = false;
  let stage = 0;
  const groups: Group[] = [];
  const byName = new Map<string, Group>();
  let sectionCount = 0;

  const group = (name: string) => {
    let found = byName.get(name);
    if (!found) {
      found = { name, sections: [] };
      byName.set(name, found);
      groups.push(found);
    }
    return found;
  };

  // `stage` is the index of the stage in progress; everything before it is done.
  for (const event of events) {
    switch (event.stage) {
      case 'starting':
        stage = Math.max(stage, 1);
        break;
      case 'brand':
        brand = event.brand;
        stage = Math.max(stage, 2);
        break;
      case 'page':
        group(`${event.name} page`);
        stage = Math.max(stage, 2);
        break;
      case 'section':
        sectionCount += 1;
        // Header and footer are written outside any page: they are shared.
        group(event.page ? `${event.page} page` : 'Shared across pages').sections.push({
          key: `${event.total}`,
          label: sectionLabel(event.sectionType),
          current: false,
        });
        stage = Math.max(stage, 2);
        break;
      case 'validating':
        stage = Math.max(stage, 3);
        break;
      case 'saving':
        stage = Math.max(stage, 4);
        break;
      case 'done':
        stage = STAGES.length;
        break;
      case 'template':
        template = true;
        break;
      default:
        break;
    }
  }

  // The newest section is the one still being written, until the model moves on.
  const last = events[events.length - 1];
  if (last?.stage === 'section') {
    for (const g of groups) {
      const match = g.sections.find((s) => s.key === `${last.total}`);
      if (match) match.current = true;
    }
  }

  return { brand, template, stage, groups, sectionCount };
}

/** Seconds since the panel mounted, ticking once a second. */
function useElapsed() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return seconds;
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
