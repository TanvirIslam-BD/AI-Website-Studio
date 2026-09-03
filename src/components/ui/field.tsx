'use client';

import { cloneElement, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

const CONTROL =
  'focus-ring w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 disabled:bg-ink-50';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(CONTROL, className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(CONTROL, 'resize-y leading-relaxed', className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, ...props },
  ref,
) {
  return <select ref={ref} className={cn(CONTROL, 'cursor-pointer pr-8', className)} {...props} />;
});

/** Label + control + optional hint, with ids wired up. */
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactElement;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-ink-500">
        {label}
      </label>
      {cloneElement(children, { id } as Record<string, unknown>)}
      {hint ? <p className="text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}

export function ColorInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-ink-200 bg-white px-2.5 py-2">
      <span className="text-[13px] font-medium text-ink-700">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-[74px] rounded border border-transparent bg-transparent text-right font-mono text-xs uppercase text-ink-600 focus-ring"
          spellCheck={false}
        />
        <span className="relative h-6 w-6 overflow-hidden rounded-md border border-ink-200">
          <input
            type="color"
            value={/^#[\da-fA-F]{6}$/.test(value) ? value : '#000000'}
            onChange={(event) => onChange(event.target.value)}
            className="absolute -inset-2 h-10 w-10 cursor-pointer border-0 bg-transparent p-0"
            aria-label={label}
          />
        </span>
      </span>
    </label>
  );
}
