import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BRAND, COMPANY, FOOTER_NAV, SOCIAL_LINKS } from '@/lib/brand';
import { Logo } from '@/components/brand/logo';
import { SocialIcon } from '@/components/brand/social-icons';
import { Container } from './primitives';

export function FinalCta({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative px-3 pb-24 sm:px-5 sm:pb-32">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[32px] border border-white/10 bg-[#0b0b10] px-6 py-20 text-center sm:py-28">
        <div className="aurora absolute left-1/2 top-[-60%] h-[44rem] w-[64rem] -translate-x-1/2 opacity-80" aria-hidden />
        <div
          className="home-grid absolute inset-0"
          style={{
            maskImage: 'radial-gradient(50% 60% at 50% 0%, black, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(50% 60% at 50% 0%, black, transparent 80%)',
          }}
          aria-hidden
        />
        <div className="relative">
          <h2 className="text-gradient mx-auto max-w-3xl text-balance text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.05em] sm:text-[4rem]">
            Your next website is one sentence away.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-white/55">
            Describe the business. Get a complete first draft in your editor, ready to refine and publish.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={signedIn ? '/dashboard' : '/signin?mode=register'}
              className="focus-ring group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-[15px] font-medium text-[#07070a] shadow-[0_0_40px_-8px_rgba(165,180,252,0.6)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              {signedIn ? 'Open your dashboard' : 'Start building free'}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#examples"
              className="focus-ring inline-flex h-12 items-center rounded-xl border border-white/15 px-7 text-[15px] font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
            >
              See what it builds
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Footer. Carries the publishing entity, its registered address and support
 * contact. Links and social profiles are filtered on `href`, so an unwritten
 * page never ships as a dead link.
 */
export function Footer() {
  const socials = SOCIAL_LINKS.filter((social) => social.href.trim().length > 0);
  const columns = FOOTER_NAV.map((column) => ({
    ...column,
    links: column.links.filter((link) => link.href.trim().length > 0),
  })).filter((column) => column.links.length > 0);

  return (
    <footer className="border-t border-white/[0.07]">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Logo tone="light" size={26} />
            <p className="mt-4 text-[13px] text-white/50">{BRAND.slogan}</p>
            <address className="mt-8 not-italic">
              <p className="text-[13px] font-medium text-white/80">{COMPANY.legalName}</p>
              {COMPANY.address.map((line) => (
                <p key={line} className="text-[13px] leading-relaxed text-white/40">
                  {line}
                </p>
              ))}
              <a
                href={`mailto:${COMPANY.supportEmail}`}
                className="focus-ring mt-3 inline-block rounded text-[13px] text-white/80 underline decoration-white/20 underline-offset-4 hover:decoration-white"
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
                      aria-label={social.platform === 'email' ? social.label : `${COMPANY.legalName} on ${social.label}`}
                      {...(social.platform === 'email' ? {} : { target: '_blank', rel: 'noreferrer noopener' })}
                      className="focus-ring grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-white/50 transition-colors hover:border-white/30 hover:text-white"
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
              <p className="text-[12px] font-medium text-white/35">{column.title}</p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="focus-ring rounded text-[13px] text-white/60 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.07] pt-7 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {COMPANY.legalName}
          </p>
          <p className="text-xs text-white/30">Next.js · Prisma on Turso · Auth.js · Vercel API</p>
        </div>
      </Container>
    </footer>
  );
}
