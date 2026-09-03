import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/utils';

/**
 * The Web Copilot AI Studio logo.
 *
 * An SVG recreation of the supplied brand mark: an angular "W" whose final
 * stroke rises past the others and is cut on the diagonal like a pen nib, with
 * a four-point spark above it.
 *
 * The W is one stroked polyline rather than filled polygons. That keeps the
 * weight uniform, gives mitred points at the apex and valleys, and makes the
 * nib angle fall out of the butt cap for free - so the whole mark stays
 * editable by changing two numbers.
 */

export type LogoTone = 'dark' | 'light' | 'brand';

const INK = { dark: '#0d0f14', light: '#ffffff', brand: '#4f46e5' } as const;

export function LogoMark({
  size = 32,
  tone = 'dark',
  className,
  title,
}: {
  size?: number;
  tone?: LogoTone;
  className?: string;
  title?: string;
}) {
  const colour = tone === 'dark' ? INK.dark : tone === 'light' ? INK.light : INK.brand;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 overflow-visible', className)}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/*
        Strokes 1-3 of the W, plus a stub into the fourth. The stub exists so
        the mitre at the right-hand valley is drawn correctly; the tapered
        blade below covers it in the same colour.
      */}
      <path
        d="M12 30 L31 82 L48 44 L64 82 L69 62"
        stroke={colour}
        strokeWidth="15"
        strokeLinejoin="miter"
        strokeLinecap="butt"
        strokeMiterlimit="12"
      />
      {/*
        The rising blade, filled rather than stroked so it can narrow towards
        the diagonal nib cut - the detail that gives the mark its character.
      */}
      <path d="M56.7 80.2 L71.3 83.8 L82.4 27.1 L73.6 24.9 Z" fill={colour} />
      {/* Four-point spark, concave sides. */}
      <path
        d="M88.5 0 Q90.4 8 97.5 10.2 Q90.4 12.4 88.5 20.5 Q86.6 12.4 79.5 10.2 Q86.6 8 88.5 0 Z"
        fill={colour}
      />
    </svg>
  );
}

/**
 * Horizontal lockup: mark beside the name. Used in navigation and app chrome
 * where vertical space is tight.
 */
export function Logo({
  size = 26,
  tone = 'dark',
  className,
  showWordmark = true,
}: {
  size?: number;
  tone?: LogoTone;
  className?: string;
  showWordmark?: boolean;
}) {
  const onDark = tone === 'light';

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} tone={tone} title={BRAND.name} />
      {showWordmark ? (
        <span className="whitespace-nowrap font-brand text-[16px] font-semibold leading-none tracking-[-0.01em]">
          <span className={onDark ? 'text-white' : 'text-ink-900'}>Web Copilot</span>
          {/* Dropped on the narrowest screens, where the full name wraps and
              crowds the header. The mark plus "Web Copilot" still identifies it. */}
          <span className={cn('hidden sm:inline', onDark ? 'text-white/55' : 'text-ink-400')}> AI Studio</span>
        </span>
      ) : null}
    </span>
  );
}

/**
 * Stacked lockup, as supplied: mark, name, then "AI STUDIO" flanked by rules.
 * For hero areas, the sign-in page and link-preview images.
 */
export function LogoStacked({
  size = 72,
  tone = 'dark',
  className,
}: {
  size?: number;
  tone?: LogoTone;
  className?: string;
}) {
  const onDark = tone === 'light';
  const rule = onDark ? 'bg-white/25' : 'bg-ink-300';

  return (
    <span className={cn('inline-flex flex-col items-center', className)}>
      <LogoMark size={size} tone={tone} title={BRAND.name} />
      <span
        className={cn(
          'mt-4 font-brand font-semibold leading-none tracking-[-0.01em]',
          onDark ? 'text-white' : 'text-ink-950',
        )}
        style={{ fontSize: size * 0.42 }}
      >
        Web Copilot
      </span>
      <span className="mt-2.5 flex w-full items-center gap-3">
        <span className={cn('h-px flex-1', rule)} />
        <span
          className={cn('font-brand font-medium uppercase leading-none', onDark ? 'text-white/70' : 'text-ink-500')}
          style={{ fontSize: size * 0.15, letterSpacing: `${size * 0.035}px` }}
        >
          AI Studio
        </span>
        <span className={cn('h-px flex-1', rule)} />
      </span>
    </span>
  );
}
