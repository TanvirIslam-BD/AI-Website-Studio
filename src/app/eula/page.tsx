import type { Metadata } from 'next';
import { currentUser } from '@/lib/tenancy';
import { BRAND, COMPANY } from '@/lib/brand';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/closing';
import { Article, Bullets, Contents, H2, Note, P, PageHeader, TextLink } from '@/components/marketing/page-shell';

const EFFECTIVE = '4 September 2026';

export const metadata: Metadata = {
  title: 'End User Licence Agreement',
  description: `The licence under which ${COMPANY.legalName} permits use of ${BRAND.name}.`,
};

const SECTIONS = [
  { id: 'agreement', label: 'This agreement' },
  { id: 'licence', label: 'Licence granted to you' },
  { id: 'form', label: 'What you receive' },
  { id: 'restrictions', label: 'Restrictions' },
  { id: 'your-content', label: 'Your content and output' },
  { id: 'ownership', label: 'Ownership' },
  { id: 'third-party', label: 'Third-party components' },
  { id: 'changes-service', label: 'Updates and changes' },
  { id: 'support-fees', label: 'Support and fees' },
  { id: 'term', label: 'Term and termination' },
  { id: 'warranty', label: 'No warranty' },
  { id: 'liability', label: 'Limitation of liability' },
  { id: 'export', label: 'Export and sanctions' },
  { id: 'law', label: 'Governing law' },
  { id: 'general', label: 'General' },
  { id: 'contact', label: 'Contact' },
];

/**
 * The end user licence agreement.
 *
 * Kept separate from the terms of service because they answer different
 * questions: the terms govern the relationship - accounts, acceptable use,
 * publishing, disputes - while this governs the narrower question of what you
 * may do with the software itself. The Vercel marketplace listing links here
 * for its EULA requirement.
 */
export default async function EulaPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <MarketingNav signedIn={Boolean(user)} anchorPrefix="/" />

      <PageHeader
        eyebrow="Legal"
        title="End User Licence Agreement"
        lede={`The licence under which ${COMPANY.legalName} permits you to use ${BRAND.name}.`}
        meta={`Effective ${EFFECTIVE}`}
      />

      <Article>
        <Contents items={SECTIONS} />

        <H2 id="agreement">1. This agreement</H2>
        <P>
          This End User Licence Agreement (&ldquo;Licence&rdquo;) is between you and {COMPANY.legalName},{' '}
          {COMPANY.address.join(', ')} (&ldquo;we&rdquo;, &ldquo;us&rdquo;), and covers your use of {BRAND.name} and
          its software (the &ldquo;Software&rdquo;).
        </P>
        <P>
          By creating an account or using the Software you accept this Licence. If you do not accept it, do not use the
          Software. If you are accepting on behalf of a company, you confirm you have authority to bind it, and
          &ldquo;you&rdquo; means that company.
        </P>
        <P>
          This Licence sits alongside our <TextLink href="/terms">Terms of Service</TextLink>, which govern the wider
          relationship - accounts, acceptable use, publishing and disputes - and our{' '}
          <TextLink href="/privacy">Privacy Policy</TextLink>, which explains how we handle personal data. Where this
          Licence and the Terms of Service address the same subject, the Terms of Service prevail.
        </P>

        <H2 id="licence">2. Licence granted to you</H2>
        <P>
          We grant you a limited, non-exclusive, non-transferable, non-sublicensable, revocable licence to access and
          use the Software through your account, for your own business or personal purposes, for as long as this
          Licence remains in effect.
        </P>
        <P>
          That covers generating websites, editing them, and publishing them to a hosting account you control. It does
          not extend to any other use of the Software.
        </P>

        <H2 id="form">3. What you receive</H2>
        <P>
          The Software is provided as a hosted service. We do not deliver a copy of it to you, and this Licence gives
          you no access to its source code and no right to run your own instance of it.
        </P>
        <P>
          What you do take away is the output. The websites you generate are static HTML and CSS published to your own
          hosting account, and they keep working whether or not you continue to use the Software. Section 5 covers your
          rights in that output.
        </P>

        <H2 id="restrictions">4. Restrictions</H2>
        <P>You may not, and may not permit anyone else to:</P>
        <Bullets
          items={[
            'Copy, modify, adapt, translate or create derivative works of the Software.',
            'Reverse engineer, decompile or disassemble the Software, or attempt to derive its source code - except to the extent that right cannot lawfully be excluded, and then only after asking us for the information first.',
            'Rent, lease, lend, sell, sublicense, host or otherwise make the Software available to a third party as your own service, or use it to build a competing product.',
            'Remove, obscure or alter any copyright, trademark or other proprietary notice.',
            'Circumvent authentication, usage limits, rate limits or any other technical restriction, or access an account or workspace that is not yours.',
            'Use automated means to create accounts, or to scrape or bulk-extract the Software.',
            'Use the Software to train a machine learning model, or to systematically extract its prompts, instructions or generated content for that purpose.',
          ]}
        />
        <P>
          Acceptable use of what you publish - the content itself - is governed by section 7 of the{' '}
          <TextLink href="/terms#acceptable-use">Terms of Service</TextLink>.
        </P>

        <H2 id="your-content">5. Your content and output</H2>
        <P>
          We claim no ownership of what you put into the Software or what it produces for you. The websites you build -
          their structure, their copy, images you supply, and the exported files - are yours.
        </P>
        <P>
          To the extent we hold any rights in output the Software generates for you, we licence them to you
          royalty-free and irrevocably, so you can use, modify, publish and sell work built on that output, including
          commercially, and including after this Licence ends.
        </P>
        <Note>
          We cannot warrant that generated output is original or free of third-party rights. Similar prompts can
          produce similar results, and the models draw on material we do not control. Review generated text and imagery
          before relying on it - particularly names, slogans, and anything you intend to register as a trademark.
        </Note>
        <P>
          You grant us the licence we need to operate the Software for you: hosting, storing and processing your
          content, and sending the relevant parts of it to the providers named in our{' '}
          <TextLink href="/privacy#processors">Privacy Policy</TextLink>. Nothing beyond that. We do not use your
          content or your prompts to train our own models.
        </P>

        <H2 id="ownership">6. Ownership</H2>
        <P>
          The Software - its code, interface, section library, prompts, documentation and branding - remains the
          property of {COMPANY.legalName} or its licensors. Every right not expressly granted in section 2 is
          reserved.
        </P>
        <P>
          If you send us feedback or suggestions, you allow us to use them to improve the Software without obligation
          or payment. You keep whatever rights you already held in the underlying ideas.
        </P>

        <H2 id="third-party">7. Third-party components</H2>
        <P>
          The Software includes open-source components licensed by their own authors. Those components are provided to
          you under their own licences, which govern them in place of this one, and nothing here restricts a right you
          have under an open-source licence. A list is available on request.
        </P>
        <P>
          The Software also depends on third-party services - hosting, a database, AI model providers, image search -
          identified in our <TextLink href="/privacy#processors">Privacy Policy</TextLink>. Your use of the account you
          publish into is a direct relationship between you and that provider, on their terms.
        </P>

        <H2 id="changes-service">8. Updates and changes</H2>
        <P>
          Because the Software is hosted, we update it continuously. Features may be added, changed or removed, and you
          will always be using the current version - there is no older version to stay on. We will not remove
          something you depend on without notice where we can reasonably avoid it.
        </P>
        <P>
          We may also change this Licence. The effective date above always reflects the current version, and for
          material changes we will notify account holders before they take effect. Continuing to use the Software after
          that date accepts the revised Licence.
        </P>

        <H2 id="support-fees">9. Support and fees</H2>
        <P>
          Support is provided by email as described on our <TextLink href="/support">support page</TextLink>. This
          Licence does not commit us to a response time or a service level.
        </P>
        <P>
          The Software is free to use at the effective date above. Section 9 of the{' '}
          <TextLink href="/terms#fees">Terms of Service</TextLink> governs fees if that changes. Your hosting provider
          may charge you separately for its own services.
        </P>

        <H2 id="term">10. Term and termination</H2>
        <P>
          This Licence runs from your first use of the Software until it is terminated. You may end it at any time by
          closing your account. We may end it if you breach it, if we are required to by law, or if continuing would
          expose us or other users to material risk - with notice and an opportunity to put things right where the
          circumstances allow.
        </P>
        <P>
          On termination your right to use the Software stops immediately. Your rights in output already generated
          (section 5) survive, as do sections 4, 6, 11, 12, 13 and 14. Websites you have already published stay live in
          your own hosting account, because they were never in ours.
        </P>

        <H2 id="warranty">11. No warranty</H2>
        <P>
          The Software is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. To the fullest extent permitted
          by law we disclaim all warranties, express or implied, including any implied warranty of merchantability,
          fitness for a particular purpose, title, and non-infringement.
        </P>
        <P>
          We do not warrant that the Software will be uninterrupted or error-free, that defects will be corrected, or
          that generated output will be accurate, original or fit for your purpose. Some jurisdictions do not allow
          these exclusions, so parts of this section may not apply to you.
        </P>

        <H2 id="liability">12. Limitation of liability</H2>
        <P>
          To the fullest extent permitted by law, we are not liable for indirect, incidental, special, consequential,
          exemplary or punitive damages, nor for lost profits, lost revenue, lost business, loss of goodwill, or loss
          or corruption of data, however caused.
        </P>
        <P>
          Our total liability arising out of or relating to the Software is limited to the greater of the amount you
          paid us for it in the twelve months before the claim, or one hundred United States dollars (US$100) - the
          same cap as section 12 of the <TextLink href="/terms#liability">Terms of Service</TextLink>, not an
          additional one.
        </P>
        <P>
          Nothing here excludes or limits liability that cannot lawfully be excluded, including for death or personal
          injury caused by negligence, or for fraud.
        </P>

        <H2 id="export">13. Export and sanctions</H2>
        <P>
          You may not use the Software, or export or re-export its output, in breach of United States export control or
          sanctions laws, including those administered by the Office of Foreign Assets Control. You confirm you are not
          located in an embargoed territory and are not a person or entity subject to those sanctions.
        </P>
        <P>
          If you are an agency of the United States government, the Software is commercial computer software and your
          rights in it are only those granted to all other users under this Licence.
        </P>

        <H2 id="law">14. Governing law</H2>
        <P>
          This Licence is governed by the laws of the State of Missouri and the federal laws of the United States,
          without regard to conflict-of-laws rules. The state and federal courts located in Missouri have exclusive
          jurisdiction over any dispute arising from it.
        </P>

        <H2 id="general">15. General</H2>
        <Bullets
          items={[
            'This Licence, the Terms of Service and the Privacy Policy are the entire agreement between us about the Software.',
            'If a provision is held unenforceable, the rest stays in force and that provision is narrowed to the minimum extent needed to make it enforceable.',
            'Our failure to enforce a provision is not a waiver of it.',
            'You may not assign this Licence without our written consent. We may assign it to an affiliate, or in connection with a merger, acquisition or sale of assets.',
            'Nothing here creates a partnership, agency or employment relationship between us.',
          ]}
        />

        <H2 id="contact">16. Contact</H2>
        <P>Questions about this Licence:</P>
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
