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
    muted: 'bg-ink-50/60 border-y border-ink-200/70',
    dark: 'bg-ink-950 text-white',
  } as const;

  return (
    <section id={id} className={cn('relative scroll-mt-16 py-20 sm:py-24', tones[tone], className)}>
      {tone === 'dark' ? (
        <>
          <div
            className="absolute inset-0 opacity-70"
            style={{ background: 'radial-gradient(70% 55% at 15% 0%, rgba(99,102,241,0.30), transparent 70%)' }}
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: 'radial-gradient(60% 50% at 100% 100%, rgba(14,165,233,0.22), transparent 70%)' }}
            aria-hidden
          />
        </>
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
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow ? (
        <p className={cn('text-xs font-semibold uppercase tracking-[0.14em]', dark ? 'text-brand-300' : 'text-brand-600')}>
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          'mt-3 text-balance text-3xl font-bold tracking-[-0.03em] sm:text-4xl',
          dark ? 'text-white' : 'text-ink-950',
        )}
      >
        {title}
      </h2>
      {body ? (
        <p className={cn('mt-4 text-pretty text-[17px] leading-relaxed', dark ? 'text-ink-300' : 'text-ink-500')}>{body}</p>
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
