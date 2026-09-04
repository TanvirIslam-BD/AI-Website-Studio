import type { Metadata } from 'next';
import { currentUser } from '@/lib/tenancy';
import { BRAND, COMPANY } from '@/lib/brand';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/closing';
import { Article, Bullets, Contents, H2, Note, P, PageHeader, TextLink } from '@/components/marketing/page-shell';

const EFFECTIVE = '4 September 2026';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `The agreement between you and ${COMPANY.legalName} for use of ${BRAND.name}.`,
};

const SECTIONS = [
  { id: 'agreement', label: 'This agreement' },
  { id: 'service', label: 'The Service' },
  { id: 'account', label: 'Your account' },
  { id: 'licence', label: 'Licence to use the Service' },
  { id: 'your-content', label: 'Your content' },
  { id: 'output', label: 'AI-generated output' },
  { id: 'acceptable-use', label: 'Acceptable use' },
  { id: 'third-party', label: 'Hosting and third parties' },
  { id: 'fees', label: 'Fees' },
  { id: 'availability', label: 'Availability' },
  { id: 'warranties', label: 'Disclaimer of warranties' },
  { id: 'liability', label: 'Limitation of liability' },
  { id: 'indemnity', label: 'Indemnity' },
  { id: 'termination', label: 'Termination' },
  { id: 'changes', label: 'Changes to these terms' },
  { id: 'law', label: 'Governing law' },
  { id: 'general', label: 'General' },
  { id: 'contact', label: 'Contact' },
];

export default async function TermsPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <MarketingNav signedIn={Boolean(user)} anchorPrefix="/" />

      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        lede={`The agreement between you and ${COMPANY.legalName} for use of ${BRAND.name}.`}
        meta={`Effective ${EFFECTIVE}`}
      />

      <Article>
        <Contents items={SECTIONS} />

        <H2 id="agreement">1. This agreement</H2>
        <P>
          These terms are a contract between you and {COMPANY.legalName}, {COMPANY.address.join(', ')}
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;). They govern your use of {BRAND.name} (the &ldquo;Service&rdquo;),
          including the website, the studio, and anything the Service publishes on your instruction.
        </P>
        <P>
          By creating an account or using the Service you accept these terms. If you do not accept them, do not use the
          Service. If you are agreeing on behalf of a company, you confirm you have authority to bind it, and
          &ldquo;you&rdquo; means that company.
        </P>
        <P>
          Two documents sit alongside these terms and form part of this agreement: the{' '}
          <TextLink href="/eula">End User Licence Agreement</TextLink>, which sets out what you may do with the
          software itself, and the <TextLink href="/privacy">Privacy Policy</TextLink>, which explains how we handle
          personal data. Where these terms and the Licence address the same subject, these terms prevail.
        </P>

        <H2 id="service">2. The Service</H2>
        <P>
          The Service generates website content from a description, lets you edit it in a visual editor and with an AI
          copilot, and publishes it as a static website to a hosting account you connect. What the Service produces is
          structured content and static HTML and CSS - it does not generate or run server-side code on your behalf.
        </P>
        <P>
          The Service is under active development. Features may be added, changed or removed. We will not remove
          something you depend on without notice where we can reasonably avoid it.
        </P>

        <H2 id="account">3. Your account</H2>
        <Bullets
          items={[
            'You must be at least 13 years old, and old enough to form a binding contract where you live.',
            'Give accurate registration information and keep it current.',
            'You are responsible for your credentials and for everything done through your account. Tell us promptly if you think it has been compromised.',
            'One person or organisation per account. Do not share an account to avoid paying for seats if and when seats are charged for.',
          ]}
        />

        <H2 id="licence">4. Licence to use the Service</H2>
        <P>
          We grant you a limited, non-exclusive, non-transferable, revocable licence to access and use the Service for
          its intended purpose, subject to these terms. The{' '}
          <TextLink href="/eula">End User Licence Agreement</TextLink> sets out that licence in full, including what it
          does and does not cover. In summary, you may not:</P>
        <Bullets
          items={[
            'Copy, modify, translate or create derivative works of the Service itself, or reverse engineer it except to the extent that right cannot lawfully be excluded.',
            'Rent, lease, sublicense, resell or offer the Service as your own product or as a competing service.',
            'Circumvent authentication, rate limits, usage limits or any other technical restriction.',
            'Scrape, crawl or bulk-extract the Service, or use automated means to create accounts.',
            'Probe or attack the Service or its infrastructure, or attempt to access another user’s workspace or data.',
            'Remove or obscure any proprietary notice in the Service.',
          ]}
        />
        <P>
          The Service, its software, design and branding remain our property or that of our licensors. Nothing here
          transfers ownership of them to you.
        </P>

        <H2 id="your-content">5. Your content</H2>
        <P>
          &ldquo;Your Content&rdquo; means everything you put into the Service or ask it to produce: prompts, text,
          images, brand assets, and the websites built from them.
        </P>
        <P>
          <strong className="font-semibold text-ink-950">You own it.</strong> We claim no ownership of Your Content. As
          between you and us, the websites you build are yours to keep, edit, export and publish, including after you
          stop using the Service.
        </P>
        <P>
          You grant us a worldwide, royalty-free licence to host, store, copy, transmit, display and process Your
          Content, and to send the relevant parts of it to the providers listed in our{' '}
          <TextLink href="/privacy">Privacy Policy</TextLink> - solely to operate the Service for you. This licence
          ends when you delete the content or close your account, except for backups already made and anything we must
          retain by law.
        </P>
        <P>
          You are responsible for having the rights to what you supply. Do not upload logos, photographs, text or
          trademarks you are not entitled to use. We do not review Your Content, but we may remove content that
          breaches these terms or the law.
        </P>

        <H2 id="output">6. AI-generated output</H2>
        <P>
          The Service uses large language models to draft content. You should treat what they produce as a first draft
          written by a machine that does not know your business.
        </P>
        <Bullets
          items={[
            'Output can be inaccurate, incomplete or plain wrong. Check every factual claim - prices, hours, credentials, guarantees, availability - before you publish it.',
            'Output is not unique to you. Similar prompts can produce similar results, and we do not warrant that generated text or layout is original or free of third-party rights.',
            'You are the publisher. Once you publish a site, its content is your statement about your business, and you are responsible for it.',
            'Generated content is not professional advice of any kind, and must not be relied on as legal, medical, financial or regulatory copy.',
          ]}
        />
        <Note>
          If your industry regulates what you may claim - health, finance, law, food, childcare - review generated copy
          against those rules before publishing. The Service does not know which regime applies to you.
        </Note>

        <H2 id="acceptable-use">7. Acceptable use</H2>
        <P>You may not use the Service, or anything it publishes, to:</P>
        <Bullets
          items={[
            'Break the law, or infringe anyone’s intellectual property, privacy or publicity rights.',
            'Impersonate a person, business or organisation, or misrepresent an affiliation you do not have.',
            'Publish a site designed to deceive - fake reviews or testimonials, invented credentials, phishing, fraudulent offers, or a storefront for goods you cannot supply.',
            'Publish malware, or content that harasses, threatens, defames or incites violence against anyone.',
            'Publish sexual content involving minors, or any other content whose creation or distribution is criminal.',
            'Generate spam, bulk unsolicited messaging, or content intended to manipulate search rankings deceptively.',
          ]}
        />
        <P>
          We may suspend or terminate an account that breaches this section, and where a published site is involved we
          may report it to the host it was published to.
        </P>

        <H2 id="third-party">8. Hosting and third parties</H2>
        <P>
          Publishing requires a hosting account of your own - currently Vercel. That account is a direct relationship
          between you and the host: their terms, their pricing, their limits, their uptime. We are not a party to it
          and cannot act for you within it.
        </P>
        <P>
          When you connect a hosting account you authorise us to create and read deployments in it on your instruction,
          in the account or team you select. You may disconnect at any time. Sites already published stay live in your
          account, and taking them down is done there.
        </P>
        <P>
          We are not responsible for a third party&rsquo;s acts, outages, price changes, or decisions about your
          account with them.
        </P>

        <H2 id="fees">9. Fees</H2>
        <P>
          The Service is free to use at the effective date of these terms. Paid plans may be introduced. If they are,
          we will state the price and what it covers before you are asked to pay, and using the Service will not incur
          a charge you have not agreed to. Your hosting provider may charge you separately for its own services.
        </P>

        <H2 id="availability">10. Availability</H2>
        <P>
          We aim to keep the Service up, but we do not commit to a service level. We may take it down for maintenance,
          impose reasonable usage limits, or restrict a feature that is being abused. Generation depends on third-party
          model providers, which can be slow or unavailable for reasons outside our control.
        </P>
        <P>
          Keep your own copies of anything you cannot afford to lose. Deployed sites live in your hosting account,
          which is a copy the Service does not control.
        </P>

        <H2 id="warranties">11. Disclaimer of warranties</H2>
        <P>
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. To the fullest extent permitted
          by law, we disclaim all warranties, express or implied, including any implied warranty of merchantability,
          fitness for a particular purpose, title, and non-infringement.
        </P>
        <P>
          We do not warrant that the Service will be uninterrupted or error-free, that generated content will be
          accurate, original or suitable for your purpose, or that a published site will achieve any particular
          result - commercial, search-related or otherwise.
        </P>
        <P>
          Some jurisdictions do not allow the exclusion of certain warranties, so parts of this section may not apply
          to you.
        </P>

        <H2 id="liability">12. Limitation of liability</H2>
        <P>
          To the fullest extent permitted by law, we will not be liable for indirect, incidental, special,
          consequential, exemplary or punitive damages, nor for lost profits, lost revenue, lost business, loss of
          goodwill, or loss or corruption of data, however caused and on any theory of liability, even if we were
          advised of the possibility.
        </P>
        <P>
          Our total liability arising out of or relating to the Service is limited to the greater of the amount you
          paid us for the Service in the twelve months before the claim, or one hundred United States dollars
          (US$100).
        </P>
        <P>
          Nothing in these terms excludes or limits liability that cannot lawfully be excluded or limited, including
          liability for death or personal injury caused by negligence, or for fraud.
        </P>

        <H2 id="indemnity">13. Indemnity</H2>
        <P>
          You will indemnify and hold us harmless from any claim, demand, loss or expense (including reasonable legal
          fees) arising from Your Content, from a website you publish, from your breach of these terms, or from your
          violation of any law or of anyone&rsquo;s rights.
        </P>

        <H2 id="termination">14. Termination</H2>
        <P>
          You may stop using the Service and close your account at any time by emailing{' '}
          <TextLink href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</TextLink> from the address on the
          account.
        </P>
        <P>
          We may suspend or terminate your access if you breach these terms, if we are required to by law, or if
          continuing would expose us or other users to material risk. Where the circumstances allow it, we will give
          you notice and an opportunity to put things right first.
        </P>
        <P>
          On termination, your right to use the Service ends and we delete your account and workspace data as described
          in the <TextLink href="/privacy">Privacy Policy</TextLink>. Sections 5 (as to ownership), 11, 12, 13 and 16
          survive.
        </P>

        <H2 id="changes">15. Changes to these terms</H2>
        <P>
          We may update these terms. The effective date at the top always reflects the current version. For material
          changes we will notify account holders by email or in the Service before they take effect. Continuing to use
          the Service after that date means you accept the revised terms; if you do not, close your account.
        </P>

        <H2 id="law">16. Governing law and disputes</H2>
        <P>
          These terms are governed by the laws of the State of Missouri and the federal laws of the United States,
          without regard to conflict-of-laws rules. The state and federal courts located in Missouri have exclusive
          jurisdiction over any dispute, and you and we consent to their jurisdiction and venue.
        </P>
        <P>
          If you have a complaint, please write to us first. Most things are resolved faster by email than by
          litigation.
        </P>

        <H2 id="general">17. General</H2>
        <Bullets
          items={[
            'These terms, the End User Licence Agreement and the Privacy Policy are the entire agreement between us about the Service, and replace any earlier understanding on the same subject.',
            'If a provision is held unenforceable, the rest remains in force and that provision is narrowed to the minimum extent needed to make it enforceable.',
            'Our failure to enforce a provision is not a waiver of it.',
            'You may not assign this agreement without our written consent. We may assign it to an affiliate or in connection with a merger, acquisition or sale of assets.',
            'Neither party is liable for a failure to perform caused by events beyond its reasonable control.',
            'Nothing here creates a partnership, agency or employment relationship between us.',
          ]}
        />

        <H2 id="contact">18. Contact</H2>
        <address className="mt-4 not-italic text-[15px] leading-[1.75] text-ink-700">
          {COMPANY.legalName}
          <br />
          {COMPANY.address.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
          <TextLink href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</TextLink>
        </address>
      </Article>

      <MarketingFooter />
    </div>
  );
}
