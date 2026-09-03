'use client';

import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { JsonSchema } from '@/lib/ai/schema';
import { cn } from '@/lib/utils';
import { Input, Select, Textarea } from '@/components/ui/field';

/**
 * Schema-driven property editor.
 *
 * The inspector is generated from each section's own zod schema (converted to
 * JSON Schema), so all 14 section types get a complete, correct editor with no
 * bespoke UI per type - and a new section type becomes editable the moment its
 * schema exists. Values still round-trip through the operations layer, which
 * remains the authority on what is valid.
 */

export type FieldChange = (value: unknown) => void;

const LABELS: Record<string, string> = {
  logoText: 'Logo text',
  logoImage: 'Logo image',
  primaryCta: 'Primary button',
  secondaryCta: 'Secondary button',
  cta: 'Button',
  paddingY: 'Vertical padding',
  showForm: 'Show enquiry form',
  submitLabel: 'Submit button label',
  href: 'Link',
  url: 'Image URL',
  alt: 'Alt text',
};

/**
 * Fields that exist for the system, not the user: identity and provider
 * bookkeeping. Filtered at every depth so nested objects stay clean too.
 */
const INTERNAL_KEYS = new Set(['id', 'type', 'hidden', 'assetId']);

export function isInternalKey(key: string): boolean {
  return INTERNAL_KEYS.has(key);
}

export function humanize(key: string): string {
  if (LABELS[key]) return LABELS[key];
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase());
}

function constOptions(schema: JsonSchema): string[] | null {
  if (Array.isArray(schema.enum)) return schema.enum as string[];
  if (Array.isArray(schema.anyOf)) {
    const options = (schema.anyOf as JsonSchema[]).map((option) => option.const);
    if (options.length > 0 && options.every((value) => value !== undefined)) return options.map(String);
  }
  return null;
}

/** A usable empty value for a schema, used when appending to a list. */
export function defaultForSchema(schema: JsonSchema): unknown {
  const options = constOptions(schema);
  if (options) return schema.type === 'number' || schema.type === 'integer' ? Number(options[0]) : options[0];

  switch (schema.type) {
    case 'string':
      return '';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object': {
      const properties = (schema.properties ?? {}) as Record<string, JsonSchema>;
      const required = new Set((schema.required ?? []) as string[]);
      return Object.fromEntries(
        Object.entries(properties)
          .filter(([key]) => required.has(key) || key === 'label' || key === 'href' || key === 'url')
          .map(([key, value]) => [key, defaultForSchema(value)]),
      );
    }
    default:
      return '';
  }
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</span>
      {children}
    </div>
  );
}

export function SchemaField({
  name,
  schema,
  value,
  onChange,
  onPickImage,
  depth = 0,
}: {
  name: string;
  schema: JsonSchema;
  value: unknown;
  onChange: FieldChange;
  onPickImage?: (apply: (url: string) => void) => void;
  depth?: number;
}) {
  const label = humanize(name);
  const options = constOptions(schema);

  if (options) {
    const numeric = schema.type === 'number' || schema.type === 'integer' || Array.isArray(schema.anyOf);
    return (
      <Labelled label={label}>
        <Select
          value={String(value ?? options[0])}
          onChange={(event) =>
            onChange(numeric && /^\d+$/.test(event.target.value) ? Number(event.target.value) : event.target.value)
          }
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {humanize(option)}
            </option>
          ))}
        </Select>
      </Labelled>
    );
  }

  if (schema.type === 'boolean') {
    return (
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-ink-200 bg-white px-3 py-2">
        <span className="text-[13px] font-medium text-ink-700">{label}</span>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 cursor-pointer accent-brand-600"
        />
      </label>
    );
  }

  if (schema.type === 'integer' || schema.type === 'number') {
    return (
      <Labelled label={label}>
        <Input
          type="number"
          value={typeof value === 'number' ? value : ''}
          min={typeof schema.minimum === 'number' ? schema.minimum : undefined}
          max={typeof schema.maximum === 'number' ? schema.maximum : undefined}
          onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))}
        />
      </Labelled>
    );
  }

  if (schema.type === 'string') {
    const maxLength = typeof schema.maxLength === 'number' ? schema.maxLength : 120;
    const isImage = name === 'url';
    const long = maxLength > 240 && !isImage;

    return (
      <Labelled label={label}>
        <div className={cn(isImage && 'flex gap-2')}>
          {long ? (
            <Textarea
              rows={Math.min(8, Math.max(3, Math.round(maxLength / 150)))}
              value={String(value ?? '')}
              maxLength={maxLength}
              onChange={(event) => onChange(event.target.value)}
            />
          ) : (
            <Input
              value={String(value ?? '')}
              maxLength={maxLength}
              placeholder={name === 'href' ? '/contact' : undefined}
              onChange={(event) => onChange(event.target.value)}
            />
          )}
          {isImage && onPickImage ? (
            <button
              type="button"
              onClick={() => onPickImage((url) => onChange(url))}
              className="shrink-0 rounded-lg border border-ink-200 px-2.5 text-[12px] font-medium text-ink-700 hover:bg-ink-50"
            >
              Browse
            </button>
          ) : null}
        </div>
        {isImage && typeof value === 'string' && value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="mt-1 h-20 w-full rounded-lg border border-ink-200 object-cover" />
        ) : null}
      </Labelled>
    );
  }

  if (schema.type === 'array') {
    return (
      <ListField
        label={label}
        items={(schema.items ?? {}) as JsonSchema}
        value={Array.isArray(value) ? value : []}
        maxItems={typeof schema.maxItems === 'number' ? schema.maxItems : 24}
        onChange={onChange}
        onPickImage={onPickImage}
        depth={depth}
      />
    );
  }

  if (schema.type === 'object') {
    const properties = (schema.properties ?? {}) as Record<string, JsonSchema>;
    const record = (value ?? {}) as Record<string, unknown>;
    return (
      <fieldset className="rounded-lg border border-ink-200 bg-ink-50/60 p-3">
        <legend className="px-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</legend>
        <div className="grid gap-3">
          {Object.entries(properties).filter(([key]) => !isInternalKey(key)).map(([key, childSchema]) => (
            <SchemaField
              key={key}
              name={key}
              schema={childSchema}
              value={record[key]}
              onPickImage={onPickImage}
              depth={depth + 1}
              onChange={(next) => onChange({ ...record, [key]: next })}
            />
          ))}
        </div>
      </fieldset>
    );
  }

  return null;
}

/** Repeatable list of items (features, testimonials, plans, nav links...). */
function ListField({
  label,
  items,
  value,
  maxItems,
  onChange,
  onPickImage,
  depth,
}: {
  label: string;
  items: JsonSchema;
  value: unknown[];
  maxItems: number;
  onChange: FieldChange;
  onPickImage?: (apply: (url: string) => void) => void;
  depth: number;
}) {
  const [open, setOpen] = useState<number | null>(value.length > 0 ? 0 : null);
  const isScalar = items.type === 'string' || items.type === 'number' || items.type === 'integer';

  const update = (index: number, next: unknown) => {
    const copy = value.slice();
    copy[index] = next;
    onChange(copy);
  };
  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setOpen(null);
  };
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const copy = value.slice();
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
    setOpen(target);
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
          {label} <span className="text-ink-400">({value.length})</span>
        </span>
        <button
          type="button"
          disabled={value.length >= maxItems}
          onClick={() => {
            onChange([...value, defaultForSchema(items)]);
            setOpen(value.length);
          }}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-medium text-brand-600 hover:bg-brand-50 disabled:opacity-40"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>

      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink-200 px-3 py-2.5 text-[12px] text-ink-400">
          No items yet.
        </p>
      ) : null}

      <div className="grid gap-1.5">
        {value.map((item, index) =>
          isScalar ? (
            <div key={index} className="flex items-center gap-1.5">
              <Input
                value={String(item ?? '')}
                onChange={(event) => update(index, event.target.value)}
                className="text-[13px]"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="Remove item"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div key={index} className="overflow-hidden rounded-lg border border-ink-200 bg-white">
              <div className="flex items-center gap-1 px-1.5 py-1.5">
                <button
                  type="button"
                  onClick={() => setOpen(open === index ? null : index)}
                  className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1.5 py-1 text-left hover:bg-ink-50"
                >
                  <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-ink-400 transition-transform', open === index && 'rotate-180')} />
                  <span className="truncate text-[13px] font-medium text-ink-800">{itemTitle(item, index)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="grid h-7 w-6 place-items-center rounded text-[11px] text-ink-400 hover:bg-ink-100 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  aria-label="Move down"
                  className="grid h-7 w-6 place-items-center rounded text-[11px] text-ink-400 hover:bg-ink-100 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="Remove item"
                  className="grid h-7 w-7 place-items-center rounded text-ink-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {open === index ? (
                <div className="grid gap-3 border-t border-ink-100 bg-ink-50/40 p-3">
                  {Object.entries((items.properties ?? {}) as Record<string, JsonSchema>)
                    .filter(([key]) => !isInternalKey(key))
                    .map(([key, childSchema]) => (
                    <SchemaField
                      key={key}
                      name={key}
                      schema={childSchema}
                      value={(item as Record<string, unknown>)?.[key]}
                      onPickImage={onPickImage}
                      depth={depth + 1}
                      onChange={(next) => update(index, { ...(item as Record<string, unknown>), [key]: next })}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function itemTitle(item: unknown, index: number): string {
  if (item && typeof item === 'object') {
    const record = item as Record<string, unknown>;
    for (const key of ['title', 'label', 'name', 'question', 'heading', 'quote', 'value', 'platform', 'alt']) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value.length > 44 ? `${value.slice(0, 44)}…` : value;
    }
  }
  return `Item ${index + 1}`;
}
