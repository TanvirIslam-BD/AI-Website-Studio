import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/utils';

/**
 * The Web Copilot AI Studio logo.
 *
 * The mark is a monogram W built from two overlapping V strokes rather than one
 * continuous zig-zag. Drawing it as two shapes is what produces the crossing at
 * the centre - each V's inner arm runs past the other's - and that crossing is
 * the detail the mark is recognised by. A single polyline cannot make it.
 *
 * Uniform stroke weight, round caps and round joins throughout: the weight and
 * the roundness are the character, and both are one number each, so the whole
 * mark stays adjustable without redrawing any path.
 */

export type LogoTone = 'dark' | 'light' | 'brand';

/** Stroke weight of the monogram, in viewBox units. */
const STROKE = 13;

/** No accent hue in the identity: the mark is pure black or pure white. */
const INK = { dark: '#0a0a0a', light: '#ffffff', brand: '#0a0a0a' } as const;

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
        Two V strokes, each running past the other at the top centre. Their
        inner arms cross rather than meeting, which is what leaves the small
        counter at the middle of the W - the mark's one distinguishing detail,
        and the reason this is not drawn as a single polyline.
      */}
      <g stroke={colour} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M20 26 L39 76 L58 26" />
        <path d="M42 26 L61 76 L80 26" />
      </g>
    </svg>
  );
}

/**
 * Horizontal lockup: mark beside the name. Used in navigation and app chrome
 * where vertical space is tight.
 *
 * Two lines, as the supplied artwork sets it - "Web Copilot" with "AI STUDIO"
 * tracked out beneath it to the same optical width. It used to run both on one
 * line with "AI Studio" simply greyed, which reads as a subtitle appended to a
 * name rather than as a lockup, and left the header disagreeing with every
 * other place the brand appears.
 *
 * The tracked line needs the trailing letter-space removed: CSS adds the gap
 * after the final letter too, so without the negative margin the second line
 * sits visibly left of the first.
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
        <span className="flex flex-col justify-center whitespace-nowrap font-brand leading-none">
          <span
            className={cn(
              'text-[16px] font-semibold tracking-[-0.01em]',
              onDark ? 'text-white' : 'text-ink-900',
            )}
          >
            Web Copilot
          </span>
          {/* Dropped on the narrowest screens, where the header is tightest.
              The mark plus "Web Copilot" still identifies it. */}
          <span
            className={cn(
              'mt-[4px] hidden text-[8px] font-medium uppercase sm:block',
              onDark ? 'text-white/55' : 'text-ink-400',
            )}
            style={{ letterSpacing: '0.33em', marginRight: '-0.33em' }}
          >
            AI Studio
          </span>
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
