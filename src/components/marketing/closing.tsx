import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { BRAND, COMPANY, FOOTER_NAV, SOCIAL_LINKS } from '@/lib/brand';
import { Logo } from '@/components/brand/logo';
import { SocialIcon } from '@/components/brand/social-icons';
import { PromptStarter } from '@/app/prompt-starter';
import { Container, Eyebrow } from './shell';

/**
 * Closing conversion section.
 *
 * The prompt box lives here rather than in the hero: the hero's job is to make
 * the workflow legible, and by this point a reader has seen enough to actually
 * describe their own site. Whatever they type is carried through sign-up into
 * the generator, so this is the real entry point, not a decorative field.
 */
export function FinalCta({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative overflow-hidden bg-ink-950 py-28 sm:py-40">
      <div className="glow-warm absolute inset-0" aria-hidden />
      <div className="grain absolute inset-0 opacity-30" aria-hidden />
      <div className="hairline-gold absolute inset-x-0 top-0" aria-hidden />
      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow dark>Begin</Eyebrow>
          <h2 className="mt-7 text-balance font-display text-[2.75rem] font-normal leading-[1.02] tracking-[-0.02em] text-white sm:text-[4rem]">
            Describe your website.
            <br />
            <em className="text-champagne pr-[0.08em] italic">We&rsquo;ll build the first version.</em>
          </h2>
          <p className="mt-6 text-[12px] uppercase tracking-[0.22em] text-white/45">Start free · No credit card required</p>
        </div>

        <div className="mx-auto mt-12 max-w-xl">
          <PromptStarter signedIn={signedIn} tone="dark" />
        </div>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={signedIn ? '/dashboard' : '/signin?mode=register'}
            className="focus-ring group inline-flex h-[52px] items-center gap-2.5 rounded-full bg-gradient-to-b from-white to-[#f1ece2] px-8 text-[15px] font-medium text-ink-950 shadow-[0_0_0_1px_rgba(215,193,154,0.45),0_18px_40px_-18px_rgba(215,193,154,0.55)] transition-all duration-300 hover:-translate-y-0.5"
          >
            {signedIn ? 'Open your dashboard' : 'Start building free'}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how-it-works"
            className="focus-ring inline-flex h-[52px] items-center rounded-full border border-white/15 px-8 text-[15px] font-medium text-white/85 transition-colors duration-300 hover:border-gold-300/50 hover:text-white"
          >
            See how it works
          </a>
        </div>
      </Container>
    </section>
  );
}

/**
 * Site footer.
 *
 * Carries the publishing entity, its registered address and support contact -
 * the details a visitor needs to know who they are dealing with. Links and
 * social profiles are filtered on `href`, so an unwritten page never ships as
 * a dead link.
 */
export function MarketingFooter() {
  const socials = SOCIAL_LINKS.filter((social) => social.href.trim().length > 0);
  const columns = FOOTER_NAV.map((column) => ({
    ...column,
    links: column.links.filter((link) => link.href.trim().length > 0),
  })).filter((column) => column.links.length > 0);

  return (
    <footer className="bg-[#f8f6f1]">
      <Container className="py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Logo size={26} />
            <p className="mt-4 font-brand text-[13px] font-medium tracking-[0.02em] text-ink-600">{BRAND.slogan}</p>

            <address className="mt-8 not-italic">
              <p className="text-[13px] font-medium text-ink-900">{COMPANY.legalName}</p>
              {COMPANY.address.map((line) => (
                <p key={line} className="text-[13px] leading-relaxed text-ink-500">
                  {line}
                </p>
              ))}
              <a
                href={`mailto:${COMPANY.supportEmail}`}
                className="focus-ring mt-3 inline-block rounded text-[13px] font-medium text-ink-900 underline decoration-ink-300 underline-offset-4 transition-colors hover:decoration-ink-900"
              >
                {COMPANY.supportEmail}
              </a>
            </address>

            {socials.length > 0 ? (
              <ul className="mt-7 flex flex-wrap gap-2">
                {socials.map((social) => (
                  <li key={social.platform}>
                    <a
                      href={social.href}
                      aria-label={
                        social.platform === 'email' ? social.label : `${COMPANY.legalName} on ${social.label}`
                      }
                      {...(social.platform === 'email' ? {} : { target: '_blank', rel: 'noreferrer noopener' })}
                      className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-[#e3ddd1] text-ink-500 transition-colors hover:border-ink-900 hover:text-ink-900"
                    >
                      <SocialIcon platform={social.platform} className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-gold-600">{column.title}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="focus-ring rounded text-[13px] text-ink-600 transition-colors hover:text-ink-950"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[#e7e1d6] pt-8 sm:flex-row">
          <p className="flex items-center gap-2 text-xs text-ink-500">
            <ShieldCheck className="h-3.5 w-3.5 text-ink-400" />© {new Date().getFullYear()} {COMPANY.legalName}
          </p>
          <p className="text-xs text-ink-400">Next.js · Prisma on Turso · Auth.js · Vercel API</p>
        </div>
      </Container>
    </footer>
  );
}
