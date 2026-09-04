import type { Metadata } from 'next';
import { currentUser } from '@/lib/tenancy';
import { BRAND, COMPANY } from '@/lib/brand';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/closing';
import { Article, Bullets, Contents, H2, Mono, Note, P, PageHeader, TextLink } from '@/components/marketing/page-shell';

const EFFECTIVE = '4 September 2026';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${COMPANY.legalName} handles data in ${BRAND.name}.`,
};

const SECTIONS = [
  { id: 'who-we-are', label: 'Who we are' },
  { id: 'what-we-collect', label: 'What we collect' },
  { id: 'not-collected', label: 'What we do not collect' },
  { id: 'your-content', label: 'Your website content' },
  { id: 'ai', label: 'AI processing' },
  { id: 'vercel', label: 'Your hosting connection' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'processors', label: 'Who else processes data' },
  { id: 'retention', label: 'How long we keep it' },
  { id: 'rights', label: 'Your rights' },
  { id: 'security', label: 'Security' },
  { id: 'children', label: 'Children' },
  { id: 'transfers', label: 'International transfers' },
  { id: 'changes', label: 'Changes' },
  { id: 'contact', label: 'Contact' },
];

export default async function PrivacyPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <MarketingNav signedIn={Boolean(user)} anchorPrefix="/" />

      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        lede={`How ${COMPANY.legalName} collects, uses and shares information when you use ${BRAND.name}.`}
        meta={`Effective ${EFFECTIVE}`}
      />

      <Article>
        <Contents items={SECTIONS} />

        <H2 id="who-we-are">1. Who we are</H2>
        <P>
          {BRAND.name} (the &ldquo;Service&rdquo;) is operated by {COMPANY.legalName}, {COMPANY.address.join(', ')}. In
          this policy, &ldquo;we&rdquo; and &ldquo;us&rdquo; mean {COMPANY.legalName}, and &ldquo;you&rdquo; means the
          person using the Service. We are the controller of the personal data described here.
        </P>
        <P>
          You can reach us about anything in this policy at{' '}
          <TextLink href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</TextLink>.
        </P>

        <H2 id="what-we-collect">2. What we collect</H2>
        <P>
          <strong className="font-semibold text-ink-950">Account information.</strong> Your email address, an optional
          display name, and a hash of your password. We store a one-way hash, not the password itself. If you sign in
          with a third-party provider instead, we store the account identifier that provider gives us and, if it
          supplies them, your name and avatar URL.
        </P>
        <P>
          <strong className="font-semibold text-ink-950">Workspace and project data.</strong> The websites you build:
          project names, pages, sections, written content, theme settings, and the image URLs in your asset library.
        </P>
        <P>
          <strong className="font-semibold text-ink-950">Prompts and copilot conversations.</strong> What you type into
          the generator and the copilot, the assistant&rsquo;s replies, and a record of which operations each reply
          performed. These are stored with the project so the conversation and its history survive a reload.
        </P>
        <P>
          <strong className="font-semibold text-ink-950">Revisions.</strong> A snapshot of a project&rsquo;s content is
          written before each AI change, so a change can be rolled back.
        </P>
        <P>
          <strong className="font-semibold text-ink-950">Deployment records.</strong> When you publish, we store the
          deployment&rsquo;s status, the resulting URL, its file count and size, and any error the host returned.
        </P>
        <P>
          <strong className="font-semibold text-ink-950">Hosting connection.</strong> If you connect a Vercel account,
          we store an encrypted access credential, the name of the account it belongs to, and the last four characters
          of the credential. See <TextLink href="#vercel">section 6</TextLink>.
        </P>
        <P>
          <strong className="font-semibold text-ink-950">Technical logs.</strong> Our hosting provider records ordinary
          server logs - IP address, request path, timestamp, user agent - and we log application errors so we can fix
          them. Error logs can incidentally contain identifiers such as a project id.
        </P>

        <H2 id="not-collected">3. What we do not collect</H2>
        <Bullets
          items={[
            'We do not use advertising or analytics trackers, and we do not embed third-party tracking scripts in the Service.',
            'We do not collect payment card details. The Service is free at the time of writing; if that changes, payments will be handled by a payment processor and this policy will be updated before it does.',
            'We do not buy personal data about you from data brokers, and we do not sell or rent your personal data to anyone.',
            'We do not ask for, and do not want, your passwords or API keys for other services beyond the hosting connection you choose to make.',
          ]}
        />

        <H2 id="your-content">4. Your website content</H2>
        <P>
          The websites you build are yours. We use their content to operate the Service - to store it, render it, let
          you edit it, and publish it where you tell us to. We do not publish it anywhere you have not asked us to, and
          we do not use it to advertise to you.
        </P>
        <P>
          We do not use your content or your prompts to train our own models, and we ask our AI provider to do the same
          (see <TextLink href="#ai">section 5</TextLink>).
        </P>
        <P>
          Anything you publish becomes a public website at the address your host assigns. Do not put information in a
          generated site that you do not want the world to read.
        </P>

        <H2 id="ai">5. AI processing</H2>
        <P>
          Generating and editing a site means sending text to a large language model. When you use the generator or the
          copilot we send our AI provider your prompt, the relevant part of your site&rsquo;s content, and instructions
          describing the tools it may call. We do not send your email address, your account identifiers, or your
          hosting credential.
        </P>
        <P>
          We reach models through <TextLink href="https://www.cometapi.com">CometAPI</TextLink>, a gateway that routes
          requests to underlying model providers such as Anthropic and OpenAI. The Service can also be configured to
          call Anthropic or OpenAI directly. Whichever route is in use, that provider processes the request on our
          behalf and is bound by its own terms and privacy commitments.
        </P>
        <Note>
          Model output is generated text. It can be wrong, and it can resemble text the model has seen elsewhere. Read
          what a generation produces before you publish it as your own - particularly claims about your business,
          prices, and anything a customer might rely on.
        </Note>

        <H2 id="vercel">6. Your hosting connection</H2>
        <P>
          To publish a site into your own hosting account, we need a credential for that account. When you connect one:
        </P>
        <Bullets
          items={[
            <>
              It is encrypted with AES-256-GCM before it is written to our database, under a key held in our server
              environment and not in the database.
            </>,
            <>
              It is never returned to a browser and never displayed. The deploy dialog shows the account name and the
              last four characters only, so you can tell which credential is stored.
            </>,
            <>
              It is used for one purpose: creating and reading the deployments you ask for, in the account or team you
              chose during the connection.
            </>,
            <>
              Disconnecting deletes it. Sites you already published remain live, because they are in your account
              rather than ours.
            </>,
          ]}
        />
        <P>
          We cannot read the credential back out on your behalf, so please do not send us one by email. If a
          connection stops working, disconnect and connect again.
        </P>

        <H2 id="cookies">7. Cookies</H2>
        <P>We set only cookies the Service needs to function:</P>
        <Bullets
          items={[
            <>
              A session cookie that keeps you signed in. It is <Mono>httpOnly</Mono>, so page scripts cannot read it.
            </>,
            <>
              Two short-lived cookies during a hosting connection, which carry the return address and a random value
              used to verify the response came from a request you started. Both are deleted as soon as the connection
              finishes, and expire on their own within ten minutes.
            </>,
          ]}
        />
        <P>
          Your browser may also store small amounts of interface state - such as which editor panel you had open - on
          your own device. That never reaches us.
        </P>
        <P>
          There are no advertising, profiling or cross-site tracking cookies, which is why the Service has no cookie
          consent banner to click through.
        </P>

        <H2 id="processors">8. Who else processes data</H2>
        <P>
          We use a small number of service providers to run the Service. They process data on our instructions and for
          no other purpose:
        </P>
        <div className="mt-6 overflow-hidden rounded-xl border border-ink-200">
          <table className="w-full border-collapse text-left">
            <tbody>
              {[
                ['Vercel', 'Hosting for this Service, and the destination for websites you publish into your own account.'],
                ['Turso', 'The database that stores your account, projects and content.'],
                ['CometAPI', 'Routes AI requests to model providers such as Anthropic and OpenAI.'],
                ['Unsplash', 'Stock photography search. Your search term is sent when you search; nothing else is.'],
              ].map(([name, purpose]) => (
                <tr key={name} className="border-b border-ink-100 last:border-0">
                  <th scope="row" className="w-[30%] px-4 py-3 align-top text-[14px] font-semibold text-ink-950">
                    {name}
                  </th>
                  <td className="px-4 py-3 align-top text-[14px] leading-relaxed text-ink-600">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          We may also disclose information where the law requires it, to enforce our{' '}
          <TextLink href="/terms">terms</TextLink>, or to protect the rights and safety of our users. If we are ever
          part of a merger or acquisition, your data may transfer with the business; we will say so before it does.
        </P>

        <H2 id="retention">9. How long we keep it</H2>
        <Bullets
          items={[
            'Account, project and conversation data: for as long as your account exists.',
            'Deleted projects: removed from our database when you delete them, together with their pages, sections, assets, revisions and conversation history.',
            'Deployment records: kept with the project, as its publishing history.',
            'Server and error logs: retained for a short period for debugging and security, then discarded.',
          ]}
        />
        <P>
          When you close your account we delete your account record and the projects belonging to your workspace. We
          may retain a minimal record that an account existed where we need it to meet a legal obligation.
        </P>

        <H2 id="rights">10. Your rights</H2>
        <P>
          Depending on where you live, you may have the right to access the personal data we hold about you, to have it
          corrected, to have it deleted, to receive a copy in a portable form, to object to or restrict certain
          processing, and to withdraw consent where we relied on it.
        </P>
        <P>
          To exercise any of these, email{' '}
          <TextLink href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</TextLink> from the address on your
          account. We will not charge you for a request or treat you differently for making one. If you are in the
          EU or UK and are unhappy with our response, you may complain to your data protection authority.
        </P>
        <P>
          We do not sell personal information or share it for cross-context behavioural advertising, so there is
          nothing for a &ldquo;do not sell&rdquo; request to switch off.
        </P>

        <H2 id="security">11. Security</H2>
        <P>
          Passwords are stored as bcrypt hashes. Hosting credentials are encrypted with AES-256-GCM. Traffic to the
          Service and to every provider listed above is encrypted in transit. Access to a workspace&rsquo;s data
          requires an authenticated session belonging to that workspace, checked on every request rather than in the
          interface alone.
        </P>
        <P>
          Published websites are static HTML and CSS with no server code, which removes whole categories of risk from
          what you put online.
        </P>
        <P>
          No service is immune. If we become aware of a breach affecting your personal data, we will notify you and any
          regulator we are required to notify, without undue delay.
        </P>

        <H2 id="children">12. Children</H2>
        <P>
          The Service is not directed to children under 13, and we do not knowingly collect their personal data. If you
          believe a child has given us information, write to us and we will delete it.
        </P>

        <H2 id="transfers">13. International transfers</H2>
        <P>
          We are based in the United States and our providers process data there. If you use the Service from outside
          the United States, your information will be transferred to and processed in the United States, where data
          protection law may differ from your own.
        </P>

        <H2 id="changes">14. Changes</H2>
        <P>
          We may update this policy as the Service changes. The effective date at the top always reflects the current
          version. If a change materially affects how we handle your data, we will tell account holders by email before
          it takes effect.
        </P>

        <H2 id="contact">15. Contact</H2>
        <P>Questions, requests and complaints about privacy:</P>
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
