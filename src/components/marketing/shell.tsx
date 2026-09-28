import { cn } from '@/lib/utils';

/** Shared layout primitives for the marketing site. */

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>{children}</div>;
}

export function Section({
  id,
  children,
  className,
  tone = 'default',
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tone?: 'default' | 'muted' | 'dark';
}) {
  // Muted bands are ivory rather than a cool grey: the warmth is what separates
  // a considered page from a template, and it sits under the neutral ramp fine.
  const tones = {
    default: 'bg-white',
    muted: 'border-y border-[#ebe6dc] bg-[#f8f6f1]',
    dark: 'bg-ink-950 text-white',
  } as const;

  return (
    <section id={id} className={cn('relative scroll-mt-16 py-24 sm:py-36', tones[tone], className)}>
      {tone === 'dark' ? (
        <>
          {/* A warm highlight from above, so a large black band reads as lit rather than flat. */}
          <div className="glow-warm absolute inset-0" aria-hidden />
          <div className="hairline-gold absolute inset-x-0 top-0" aria-hidden />
        </>
      ) : null}
      <div className="relative">{children}</div>
    </section>
  );
}

/**
 * Renders a heading string, setting any `*phrase*` in the display italic with a
 * champagne finish. One accent per heading keeps it a point of emphasis rather
 * than decoration; plain strings render unchanged.
 */
export function Accented({ text, dark = false }: { text: string; dark?: boolean }) {
  const parts = text.split(/\*([^*]+)\*/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <em key={i} className={cn('font-display italic pr-[0.08em]', dark ? 'text-champagne' : 'text-champagne-deep')}>
            {part}
          </em>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** Small tracked label with a champagne rule, used above section headings. */
export function Eyebrow({
  children,
  dark = false,
  align = 'center',
  className,
}: {
  children: React.ReactNode;
  dark?: boolean;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <p
      className={cn(
        'flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.32em]',
        align === 'center' && 'justify-center',
        dark ? 'text-gold-300' : 'text-gold-600',
        className,
      )}
    >
      <span className={cn('h-px w-8', dark ? 'bg-gold-300/50' : 'bg-gold-500/50')} aria-hidden />
      {children}
      {align === 'center' ? (
        <span className={cn('h-px w-8', dark ? 'bg-gold-300/50' : 'bg-gold-500/50')} aria-hidden />
      ) : null}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = 'center',
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  align?: 'left' | 'center';
  dark?: boolean;
}) {
  return (
    <div className={cn('reveal max-w-3xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow ? (
        <Eyebrow dark={dark} align={align}>
          {eyebrow}
        </Eyebrow>
      ) : null}
      <h2
        className={cn(
          'mt-6 text-balance font-display text-[2.6rem] font-normal leading-[1.02] tracking-[-0.02em] sm:text-[3.5rem]',
          dark ? 'text-white' : 'text-ink-950',
        )}
      >
        <Accented text={title} dark={dark} />
      </h2>
      {body ? (
        <p
          className={cn(
            'mx-auto mt-6 max-w-2xl text-pretty text-[16px] leading-[1.75] sm:text-[17px]',
            align === 'left' && 'mx-0',
            dark ? 'text-white/55' : 'text-ink-500',
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

/** Terminal-style frame used for the code and JSON samples. */
export function CodeFrame({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-ink-800 bg-ink-950 shadow-pop', className)}>
      {title ? (
        <div className="flex items-center gap-2 border-b border-ink-800 px-4 py-2.5">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
          </span>
          <span className="ml-1 font-mono text-[11px] text-ink-400">{title}</span>
        </div>
      ) : null}
      <div className="studio-scroll overflow-x-auto p-4">{children}</div>
    </div>
  );
}
