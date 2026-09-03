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
  const tones = {
    default: 'bg-white',
    muted: 'border-y border-ink-200 bg-[#fafafa]',
    dark: 'bg-ink-950 text-white',
  } as const;

  return (
    <section id={id} className={cn('relative scroll-mt-16 py-20 sm:py-28', tones[tone], className)}>
      {tone === 'dark' ? (
        // A single soft highlight, no hue: enough to stop a large black band
        // reading as a flat rectangle.
        <div
          className="absolute inset-0 opacity-70"
          style={{ background: 'radial-gradient(70% 55% at 50% 0%, rgba(255,255,255,0.08), transparent 72%)' }}
          aria-hidden
        />
      ) : null}
      <div className="relative">{children}</div>
    </section>
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
    <div className={cn('reveal max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow ? (
        <p className={cn('font-mono text-[11px] uppercase tracking-[0.2em]', dark ? 'text-ink-500' : 'text-ink-400')}>
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          'mt-4 text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.035em] sm:text-[2.5rem]',
          dark ? 'text-white' : 'text-ink-950',
        )}
      >
        {title}
      </h2>
      {body ? (
        <p className={cn('mt-4 text-pretty text-[16px] leading-relaxed', dark ? 'text-ink-400' : 'text-ink-500')}>
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
