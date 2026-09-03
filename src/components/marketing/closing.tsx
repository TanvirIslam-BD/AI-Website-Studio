import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';
import { BRAND, NAV_LINKS } from '@/lib/brand';
import { Container } from './shell';

export function FinalCta({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative overflow-hidden bg-ink-950 py-20 sm:py-24">
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: 'radial-gradient(60% 60% at 50% 0%, rgba(99,102,241,0.55), transparent)' }}
        aria-hidden
      />
      <Container className="relative text-center">
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">
          Describe your business. See it as a website in under a minute.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-pretty text-[17px] leading-relaxed text-ink-300">
          Free to start, no credit card, and the site you build is yours to keep.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={signedIn ? '/dashboard' : '/signin?mode=register'}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-ink-950 transition-colors hover:bg-ink-100"
          >
            {signedIn ? 'Open your dashboard' : 'Start building free'}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex h-12 items-center rounded-xl border border-ink-700 px-7 text-sm font-semibold text-ink-200 transition-colors hover:border-ink-500 hover:text-white"
          >
            See how it works
          </a>
        </div>
      </Container>
    </section>
  );
}

const FOOTER_COLUMNS = [
  { title: 'Product', links: NAV_LINKS.map((link) => ({ label: link.label, href: link.href })) },
  {
    title: 'Get started',
    links: [
      { label: 'Create an account', href: '/signin?mode=register' },
      { label: 'Sign in', href: '/signin' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-ink-200/70 bg-white">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))]">
          <div>
            <span className="inline-flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-ink-900 text-[13px] font-black text-white">
                W
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-ink-900">{BRAND.name}</span>
            </span>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ink-500">{BRAND.tagline}. Structured sites,
              visual editing, and one-click deployment to your own Vercel account.</p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[13px] text-ink-600 transition-colors hover:text-ink-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-200/70 pt-7 sm:flex-row">
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} {BRAND.company}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-ink-400">
            <Github className="h-3.5 w-3.5" />
            Next.js · Prisma on Turso · Auth.js · Vercel API
          </p>
        </div>
      </Container>
    </footer>
  );
}
