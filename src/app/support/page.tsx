import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, LifeBuoy, Mail } from 'lucide-react';
import { currentUser } from '@/lib/tenancy';
import { BRAND, COMPANY, SOCIAL_LINKS } from '@/lib/brand';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/closing';
import { Article, Bullets, H2, Mono, Note, P, PageHeader, TextLink } from '@/components/marketing/page-shell';

export const metadata: Metadata = {
  title: 'Support',
  description: `How to get help with ${BRAND.name}, and what to include so we can answer quickly.`,
};

/**
 * Support page.
 *
 * Deliberately does not promise a response window or a phone line that does
 * not exist. What it does do is make the one real channel obvious and tell
 * people what to include, which is the difference between one reply and four.
 */
export default async function SupportPage() {
  const user = await currentUser();
  const socials = SOCIAL_LINKS.filter((social) => social.platform !== 'email' && social.href.trim().length > 0);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <MarketingNav signedIn={Boolean(user)} anchorPrefix="/" />

      <PageHeader
        eyebrow="Support"
        title="Something not working? Tell us."
        lede="One channel, read by the people who build the product."
      />

      <Article>
        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href={`mailto:${COMPANY.supportEmail}`}
            className="focus-ring group rounded-xl border border-ink-200 p-5 transition-colors hover:border-ink-900"
          >
            <Mail className="h-4 w-4 text-ink-400" />
            <p className="mt-3 text-[14px] font-semibold text-ink-950">Email support</p>
            <p className="mt-1 break-all text-[13px] text-ink-600">{COMPANY.supportEmail}</p>
            <p className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-ink-950">
              Write to us <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </p>
          </a>
          <Link
            href="/docs"
            className="focus-ring group rounded-xl border border-ink-200 p-5 transition-colors hover:border-ink-900"
          >
            <LifeBuoy className="h-4 w-4 text-ink-400" />
            <p className="mt-3 text-[14px] font-semibold text-ink-950">Documentation</p>
            <p className="mt-1 text-[13px] text-ink-600">How generating, editing and deploying actually work.</p>
            <p className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-ink-950">
              Read the docs <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </p>
          </Link>
        </div>

        <H2 id="what-to-include">What to include</H2>
        <P>
          Most problems are diagnosable from four things, and sending them up front usually saves a round trip:
        </P>
        <Bullets
          items={[
            'The email address on your account, so we can find the workspace.',
            'The project name, and the page or section if it is specific to one.',
            'What you expected, and what happened instead.',
            'If it involves publishing: the URL Vercel returned, or the exact message the deploy dialog showed.',
          ]}
        />
        <Note>
          Never send us a password, an access token or an API key. We do not need any of them, and we cannot read the
          hosting credential stored for your workspace even if you ask us to - it is encrypted and never shown back.
        </Note>

        <H2 id="common">Before you write</H2>
        <P>Two things account for most of what reaches us.</P>
        <P>
          <strong className="font-semibold text-ink-950">A deployment was refused.</strong> This is almost always the
          connected Vercel account rather than your site. Open the deploy dialog: if it offers{' '}
          <strong className="font-semibold text-ink-950">Continue with Vercel</strong>, the site would otherwise
          publish somewhere you do not control, and connecting your own account fixes it. If it says the connection was
          not accepted, disconnect and connect again - the install may have been removed on Vercel&rsquo;s side.
        </P>
        <P>
          <strong className="font-semibold text-ink-950">A generated site is not what you described.</strong> Say what
          it should be instead, in the copilot, scoped to the section you mean. Regenerating from scratch throws away
          edits you may want to keep; a correction does not.
        </P>

        <H2 id="accounts">Account and data requests</H2>
        <P>
          To export or delete your projects, or to close your account, email{' '}
          <TextLink href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</TextLink> from the address on the
          account. What we hold and how long we hold it is set out in the{' '}
          <TextLink href="/privacy">privacy policy</TextLink>.
        </P>
        <P>
          Sites you have already published live in your own Vercel account. Closing an account here does not take them
          down, and deleting them is done from your Vercel dashboard.
        </P>

        <H2 id="vercel">Questions that belong to Vercel</H2>
        <P>
          Domains, DNS, analytics, build minutes and billing on the account you deploy into are handled in your Vercel
          dashboard, and <TextLink href="https://vercel.com/docs">their documentation</TextLink> is the better answer
          for those. Anything about generating, editing or publishing a site is ours.
        </P>

        {socials.length > 0 ? (
          <>
            <H2 id="elsewhere">Elsewhere</H2>
            <P>
              We post product updates on these. They are not support channels - a message here is faster and does not
              get lost.
            </P>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {socials.map((social) => (
                <li key={social.platform}>
                  <TextLink href={social.href}>{social.label}</TextLink>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <H2 id="who">Who you are writing to</H2>
        <P>
          {BRAND.name} is built by {COMPANY.legalName}.
        </P>
        <address className="mt-4 not-italic text-[15px] leading-[1.75] text-ink-700">
          {COMPANY.legalName}
          <br />
          {COMPANY.address.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </address>
        <P>
          Support is by email at <Mono>{COMPANY.supportEmail}</Mono>. We do not operate a phone line, so the address
          above is for correspondence rather than visits.
        </P>
      </Article>

      <MarketingFooter />
    </div>
  );
}
