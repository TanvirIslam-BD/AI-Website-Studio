'use client';

import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Selection chrome for one section on the canvas: outline, type label, and the
 * inline actions (reorder, duplicate, hide, delete). Chrome is counter-scaled
 * so it stays legible when the canvas is zoomed out for tablet/mobile widths.
 */
export function SectionFrame({
  label,
  hidden,
  structural,
  index,
  total,
  selected,
  scale,
  children,
  onSelect,
  onMove,
  onDuplicate,
  onToggle,
  onDelete,
}: {
  label: string;
  hidden: boolean;
  structural: boolean;
  index: number;
  total: number;
  selected: boolean;
  scale: number;
  children: React.ReactNode;
  onSelect: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onDuplicate: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const chromeScale = 1 / Math.max(scale, 0.35);

  return (
    <div
      role="presentation"
      onClick={onSelect}
      className={cn('group/section relative isolate cursor-pointer', hidden && 'opacity-40')}
    >
      {children}

      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-10 transition-shadow',
          selected
            ? 'shadow-[inset_0_0_0_2px_theme(colors.brand.500)]'
            : 'group-hover/section:shadow-[inset_0_0_0_1.5px_theme(colors.brand.400)]',
        )}
      />

      <div
        className={cn(
          'absolute left-2 top-2 z-20 flex origin-top-left items-center gap-1 opacity-0 transition-opacity',
          selected ? 'opacity-100' : 'group-hover/section:opacity-100',
        )}
        style={{ transform: `scale(${chromeScale})` }}
      >
        <span
          className={cn(
            'rounded-md px-2 py-1 text-[11px] font-semibold shadow-panel',
            selected ? 'bg-brand-600 text-white' : 'bg-white text-ink-700',
          )}
        >
          {label}
          {hidden ? ' · hidden' : ''}
        </span>
      </div>

      <div
        className={cn(
          'absolute right-2 top-2 z-20 flex origin-top-right items-center gap-0.5 rounded-lg border border-ink-200 bg-white/95 p-1 opacity-0 shadow-panel transition-opacity',
          selected ? 'opacity-100' : 'group-hover/section:opacity-100',
        )}
        style={{ transform: `scale(${chromeScale})` }}
      >
        <ChromeButton title="Move up" disabled={index === 0 || structural} onClick={() => onMove('up')}>
          <ArrowUp className="h-3.5 w-3.5" />
        </ChromeButton>
        <ChromeButton title="Move down" disabled={index === total - 1 || structural} onClick={() => onMove('down')}>
          <ArrowDown className="h-3.5 w-3.5" />
        </ChromeButton>
        <ChromeButton title="Duplicate" disabled={structural} onClick={onDuplicate}>
          <Copy className="h-3.5 w-3.5" />
        </ChromeButton>
        <ChromeButton title={hidden ? 'Show section' : 'Hide section'} onClick={onToggle}>
          {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </ChromeButton>
        <ChromeButton title="Delete section" onClick={onDelete} destructive>
          <Trash2 className="h-3.5 w-3.5" />
        </ChromeButton>
      </div>
    </div>
  );
}

function ChromeButton({
  children,
  title,
  onClick,
  disabled,
  destructive,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        'grid h-7 w-7 place-items-center rounded-md text-ink-500 transition-colors disabled:opacity-30',
        destructive ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-ink-100 hover:text-ink-900',
      )}
    >
      {children}
    </button>
  );
}
