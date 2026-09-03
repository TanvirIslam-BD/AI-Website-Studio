import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { BRAND, COMPANY, NAV_LINKS, SOCIAL_LINKS } from '@/lib/brand';
import { Container } from './shell';
import { Logo } from '@/components/brand/logo';
import { SocialIcon } from '@/components/brand/social-icons';

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

/**
 * Site footer.
 *
 * Dark, so it reads as one surface with the closing call to action above it.
 * Carries the publishing entity, its registered address and support contact -
 * the details a visitor needs to know who they are dealing with.
 */
export function MarketingFooter() {
  // Unset profiles are skipped rather than rendered as dead links.
  const socials = SOCIAL_LINKS.filter((social) => social.href.trim().length > 0);

  return (
    <footer className="border-t border-white/10 bg-ink-950">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))]">
          <div>
            <Logo size={26} tone="light" />
            <p className="mt-4 font-brand text-[13px] font-medium tracking-[0.02em] text-white/70">{BRAND.slogan}</p>
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-ink-400">
              Structured sites, visual editing, and one-click deployment to your own Vercel account.
            </p>

            <address className="mt-8 not-italic">
              <p className="text-[13px] font-semibold text-white">{COMPANY.legalName}</p>
              {COMPANY.address.map((line) => (
                <p key={line} className="text-[13px] leading-relaxed text-ink-400">
                  {line}
                </p>
              ))}
              <a
                href={`mailto:${COMPANY.supportEmail}`}
                className="mt-3 inline-block text-[13px] font-medium text-brand-300 transition-colors hover:text-brand-200"
              >
                {COMPANY.supportEmail}
              </a>
            </address>

            {socials.length > 0 ? (
              <ul className="mt-7 flex flex-wrap gap-2.5">
                {socials.map((social) => (
                  <li key={social.platform}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      title={social.label}
                      {...(social.platform === 'email' ? {} : { target: '_blank', rel: 'noreferrer noopener' })}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-ink-300 transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                    >
                      <SocialIcon platform={social.platform} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[13px] text-ink-300 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 sm:flex-row">
          <p className="flex items-center gap-2 text-xs text-ink-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />© {new Date().getFullYear()} {COMPANY.legalName}.
            All rights reserved.
          </p>
          <p className="text-xs text-ink-500">Next.js · Prisma on Turso · Auth.js · Vercel API</p>
        </div>
      </Container>
    </footer>
  );
}
