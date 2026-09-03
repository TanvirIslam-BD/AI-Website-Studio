'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { SECTION_META, SECTION_TYPES, type SectionType } from '@/lib/website/sections';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useActivePage, useEditor } from '../store';

const GROUP_LABELS = {
  structure: 'Structure',
  content: 'Content',
  social: 'Social proof',
  convert: 'Conversion',
} as const;

export function SectionsPanel() {
  const page = useActivePage();
  const selectedId = useEditor((state) => state.selectedSectionId);
  const select = useEditor((state) => state.select);
  const run = useEditor((state) => state.run);
  const [adding, setAdding] = useState(false);

  if (!page) return null;
  const existingTypes = new Set(page.sections.map((section) => section.type));

  return (
    <div className="flex h-full flex-col">
      <div className="studio-scroll flex-1 overflow-y-auto p-2">
        <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">{page.name}</p>

        <ul className="grid gap-0.5">
          {page.sections.map((section, index) => {
            const meta = SECTION_META[section.type];
            const structural = section.type === 'header' || section.type === 'footer';
            const selected = section.id === selectedId;

            return (
              <li
                key={section.id}
                className={cn(
                  'group flex items-center gap-1 rounded-lg px-1.5 py-1.5 transition-colors',
                  selected ? 'bg-brand-50' : 'hover:bg-ink-100',
                  section.hidden && 'opacity-50',
                )}
              >
                <button type="button" onClick={() => select(section.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <span
                    className={cn(
                      'grid h-6 w-6 shrink-0 place-items-center rounded-md text-[10px] font-bold',
                      selected ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500',
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block truncate text-[13px] font-medium', selected ? 'text-brand-800' : 'text-ink-800')}>
                      {meta.label}
                    </span>
                    <span className="block truncate text-[10px] text-ink-400">{summary(section)}</span>
                  </span>
                </button>

                <span className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
                  <IconAction label="Move up" disabled={index === 0 || structural} onClick={() => run('move_section', { sectionId: section.id, direction: 'up' })}>
                    <ArrowUp className="h-3 w-3" />
                  </IconAction>
                  <IconAction
                    label="Move down"
                    disabled={index === page.sections.length - 1 || structural}
                    onClick={() => run('move_section', { sectionId: section.id, direction: 'down' })}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </IconAction>
                  <IconAction label="Duplicate" disabled={structural} onClick={() => run('duplicate_section', { sectionId: section.id })}>
                    <Copy className="h-3 w-3" />
                  </IconAction>
                  <IconAction
                    label={section.hidden ? 'Show' : 'Hide'}
                    onClick={() => run('toggle_section', { sectionId: section.id, hidden: !section.hidden })}
                  >
                    {section.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </IconAction>
                  <IconAction label="Delete" destructive onClick={() => run('delete_section', { sectionId: section.id })}>
                    <Trash2 className="h-3 w-3" />
                  </IconAction>
                </span>
              </li>
            );
          })}
        </ul>

        {adding ? <AddSectionMenu pageId={page.id} existing={existingTypes} onAdded={() => setAdding(false)} /> : null}
      </div>

      <div className="border-t border-ink-200/70 p-2">
        <Button variant="secondary" size="sm" className="w-full justify-center" onClick={() => setAdding((value) => !value)}>
          <Plus className="h-3.5 w-3.5" /> Add section
        </Button>
      </div>
    </div>
  );
}

function AddSectionMenu({
  pageId,
  existing,
  onAdded,
}: {
  pageId: string;
  existing: Set<string>;
  onAdded: () => void;
}) {
  const run = useEditor((state) => state.run);

  return (
    <div className="mt-2 rounded-lg border border-ink-200 bg-white p-2">
      {(Object.keys(GROUP_LABELS) as Array<keyof typeof GROUP_LABELS>).map((group) => {
        const types = SECTION_TYPES.filter((type) => SECTION_META[type].group === group);
        if (types.length === 0) return null;
        return (
          <div key={group} className="mb-2 last:mb-0">
            <p className="px-1 pb-1 text-[10px] font-bold uppercase tracking-wide text-ink-400">{GROUP_LABELS[group]}</p>
            <div className="grid gap-0.5">
              {types.map((type) => {
                const disabled = Boolean(SECTION_META[type].singleton && existing.has(type));
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (run('add_section', { page: pageId, type })) onAdded();
                    }}
                    className="flex flex-col rounded-md px-2 py-1.5 text-left hover:bg-ink-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <span className="text-[12px] font-medium text-ink-800">{SECTION_META[type].label}</span>
                    <span className="text-[10px] text-ink-400">
                      {disabled ? 'Already on this page' : SECTION_META[type].description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function summary(section: { type: SectionType } & Record<string, unknown>): string {
  const heading = section.heading ?? section.logoText;
  if (typeof heading === 'string' && heading.trim()) return heading.length > 38 ? `${heading.slice(0, 38)}…` : heading;
  if (typeof section.variant === 'string') return section.variant;
  return SECTION_META[section.type].description;
}

function IconAction({
  children,
  label,
  onClick,
  disabled,
  destructive,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'grid h-6 w-6 place-items-center rounded text-ink-400 transition-colors disabled:opacity-25',
        destructive ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-ink-200 hover:text-ink-800',
      )}
    >
      {children}
    </button>
  );
}
