'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, Layers, Sparkles, Wand2 } from 'lucide-react';
import { zodToJsonSchema, type JsonSchema } from '@/lib/ai/schema';
import { SECTION_META, sectionSchemas, type Section } from '@/lib/website/sections';
import { SECTION_QUICK_ACTIONS } from '@/lib/ai/agent';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SchemaField, humanize, isInternalKey } from './schema-form';
import { ImagePicker } from './image-picker';
import { useEditor } from './store';

/** Props shown under "Layout" rather than "Content". */
const LAYOUT_KEYS = new Set(['variant', 'columns', 'align', 'background', 'paddingY', 'sticky']);

/**
 * Section inspector.
 *
 * Reads the selected section's schema and renders an editor for it. Every edit
 * becomes an `update_section` operation, so inspector changes, canvas actions
 * and copilot edits all mutate the document the same way and share undo/redo.
 */
export function Inspector({ section, onAskAi }: { section: Section; onAskAi: (instruction: string) => void }) {
  const run = useEditor((state) => state.run);
  const select = useEditor((state) => state.select);
  const copilotBusy = useEditor((state) => state.copilotBusy);
  const [picker, setPicker] = useState<((url: string) => void) | null>(null);

  const meta = SECTION_META[section.type];
  const schema = useMemo(() => zodToJsonSchema(sectionSchemas[section.type]), [section.type]);
  const properties = (schema.properties ?? {}) as Record<string, JsonSchema>;

  const entries = Object.entries(properties).filter(([key]) => !isInternalKey(key));
  const layout = entries.filter(([key]) => LAYOUT_KEYS.has(key));
  const content = entries.filter(([key]) => !LAYOUT_KEYS.has(key));

  const record = section as unknown as Record<string, unknown>;
  const update = (key: string, value: unknown) => run('update_section', { sectionId: section.id, props: { [key]: value } });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-ink-200/70 px-3 py-2.5">
        <button
          type="button"
          onClick={() => select(null)}
          className="grid h-7 w-7 place-items-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-800"
          aria-label="Back to sections"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ink-900">{meta.label}</p>
          <p className="truncate text-[11px] text-ink-400">{meta.description}</p>
        </div>
      </div>

      <div className="studio-scroll flex-1 overflow-y-auto">
        <Group title="Ask AI" icon={<Sparkles className="h-3.5 w-3.5" />}>
          <div className="flex flex-wrap gap-1.5">
            {SECTION_QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                disabled={copilotBusy}
                onClick={() => onAskAi(`${action.instruction} (section id ${section.id})`)}
                className={cn(
                  'rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-600 transition-colors',
                  'hover:border-brand-300 hover:text-brand-700 disabled:opacity-50',
                )}
              >
                <Wand2 className="mr-1 inline h-3 w-3" />
                {action.label}
              </button>
            ))}
          </div>
        </Group>

        {layout.length > 0 ? (
          <Group title="Layout" icon={<Layers className="h-3.5 w-3.5" />}>
            <div className="grid gap-3">
              {layout.map(([key, fieldSchema]) => (
                <SchemaField
                  key={key}
                  name={key}
                  schema={fieldSchema}
                  value={record[key]}
                  onChange={(value) => update(key, value)}
                />
              ))}
            </div>
          </Group>
        ) : null}

        <Group title="Content">
          <div className="grid gap-3.5">
            {content.map(([key, fieldSchema]) => (
              <SchemaField
                key={key}
                name={key}
                schema={fieldSchema}
                value={record[key]}
                onChange={(value) => update(key, value)}
                onPickImage={(apply) => setPicker(() => apply)}
              />
            ))}
          </div>
        </Group>

        <div className="px-3 pb-6">
          <p className="rounded-lg bg-ink-50 px-2.5 py-2 font-mono text-[10px] text-ink-400">
            {section.type} · {section.id}
          </p>
        </div>
      </div>

      {picker ? (
        <ImagePicker
          onPick={(url) => picker(url)}
          onClose={() => setPicker(null)}
        />
      ) : null}
    </div>
  );
}

function Group({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b border-ink-100 px-3 py-3.5">
      <h3 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-500">
        {icon}
        {humanize(title)}
      </h3>
      {children}
    </section>
  );
}
