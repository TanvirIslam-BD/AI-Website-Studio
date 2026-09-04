import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Container } from './shell';

/**
 * Layout primitives for the standalone pages - documentation, support, privacy
 * and terms.
 *
 * These pages are read, not scanned, so they get a single measured column and
 * a plain type scale rather than the marketing page's full-bleed sections. The
 * primitives are exported individually so each page composes its own structure
 * instead of passing content through a generic renderer.
 */

export function PageHeader({
  eyebrow,
  title,
  lede,
  meta,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  meta?: string;
}) {
  return (
    <header className="border-b border-ink-200 bg-[#fafafa]">
      <Container className="py-14 sm:py-20">
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-1.5 rounded text-[13px] text-ink-500 transition-colors hover:text-ink-950"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-balance text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.035em] text-ink-950 sm:text-[3rem]">
          {title}
        </h1>
        {lede ? <p className="mt-5 max-w-2xl text-pretty text-[17px] leading-relaxed text-ink-600">{lede}</p> : null}
        {meta ? <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">{meta}</p> : null}
      </Container>
    </header>
  );
}

/** The reading column. Roughly 70 characters, which is where prose stays easy. */
export function Article({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Container className="py-14 sm:py-20">
      <div className={cn('max-w-[68ch]', className)}>{children}</div>
    </Container>
  );
}

export function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-14 scroll-mt-20 text-[1.375rem] font-semibold tracking-[-0.02em] text-ink-950 first:mt-0 sm:text-[1.5rem]"
    >
      {children}
    </h2>
  );
}

export function H3({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="mt-9 scroll-mt-20 text-[15px] font-semibold text-ink-950">
      {children}
    </h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-[15px] leading-[1.75] text-ink-700">{children}</p>;
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-4 grid gap-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 text-[15px] leading-[1.7] text-ink-700">
          <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-ink-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** A numbered sequence, for anything the reader is meant to follow in order. */
export function Steps({ items }: { items: Array<{ title: string; body: React.ReactNode }> }) {
  return (
    <ol className="mt-6 grid gap-6">
      {items.map((item, index) => (
        <li key={item.title} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-4">
          <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-lg bg-ink-950 font-mono text-[12px] font-medium text-white">
            {index + 1}
          </span>
          <div>
            <p className="text-[15px] font-semibold text-ink-950">{item.title}</p>
            <div className="mt-1.5 text-[15px] leading-[1.7] text-ink-700">{item.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Pulled-aside detail: a caveat, a limit, or something easy to get wrong. */
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 border-l-2 border-ink-900 bg-ink-50 px-5 py-4">
      <div className="text-[14px] leading-[1.7] text-ink-700">{children}</div>
    </div>
  );
}

export function Term({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="text-[14px] font-semibold text-ink-950">{label}</p>
      <div className="mt-1 text-[15px] leading-[1.7] text-ink-700">{children}</div>
    </div>
  );
}

export function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[0.85em] text-ink-900">{children}</code>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      className="focus-ring rounded font-medium text-ink-950 underline decoration-ink-300 underline-offset-[3px] transition-colors hover:decoration-ink-900"
    >
      {children}
    </a>
  );
}

/** Sticky in-page contents, for the two long legal pages. */
export function Contents({ items }: { items: Array<{ id: string; label: string }> }) {
  return (
    <nav aria-label="On this page" className="mb-14 border-y border-ink-200 py-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">On this page</p>
      <ol className="mt-4 grid gap-1.5 sm:grid-cols-2">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="focus-ring rounded text-[13px] text-ink-600 transition-colors hover:text-ink-950"
            >
              <span className="font-mono text-ink-400">{String(index + 1).padStart(2, '0')}</span> {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
