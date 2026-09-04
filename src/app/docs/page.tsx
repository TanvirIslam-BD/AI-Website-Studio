import type { Metadata } from 'next';
import { currentUser } from '@/lib/tenancy';
import { BRAND } from '@/lib/brand';
import { SECTION_META, SECTION_TYPES } from '@/lib/website/sections';
import { THEME_PRESETS } from '@/lib/website/theme';
import { DOCUMENT_TOOLS } from '@/lib/ai/tools';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/closing';
import { Article, Bullets, H2, H3, Mono, Note, P, PageHeader, Steps, TextLink } from '@/components/marketing/page-shell';

export const metadata: Metadata = {
  title: 'Documentation',
  description: `How to generate, edit and deploy a website with ${BRAND.name}.`,
};

/**
 * Product documentation.
 *
 * The section table, the brand kits and the copilot's tool list all render
 * from the product's own registries, so the documentation cannot describe
 * sections, presets or capabilities that do not exist.
 */
export default async function DocsPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <MarketingNav signedIn={Boolean(user)} anchorPrefix="/" />

      <PageHeader
        eyebrow="Documentation"
        title="From a sentence to a deployed website"
        lede="How the studio works, what it generates, and how a finished site reaches your own Vercel account."
      />

      <Article>
        <H2 id="getting-started">Getting started</H2>
        <Steps
          items={[
            {
              title: 'Create an account',
              body: (
                <>
                  <TextLink href="/signin?mode=register">Create an account</TextLink> with an email address and a
                  password. A workspace is made for you on first use - everything you build belongs to it.
                </>
              ),
            },
            {
              title: 'Describe the website you want',
              body: 'On the dashboard, write a sentence or two about the business. One line is enough to start; more detail gives the generator more to work with.',
            },
            {
              title: 'Review what came back',
              body: 'You get a complete multi-page site: pages, sections, written copy, images and a matching brand kit. Nothing is a placeholder you have to hunt down.',
            },
            {
              title: 'Refine it',
              body: 'Edit any section by hand in the visual editor, or tell the copilot what to change in plain language. Both go through the same validated operations.',
            },
            {
              title: 'Deploy it',
              body: 'Connect your Vercel account and publish. The site is yours, in your account, on your domain.',
            },
          ]}
        />

        <H2 id="generating">Generating a website</H2>
        <P>
          A prompt is a description of the business, not a description of a web page. You do not need to ask for a hero
          section or a testimonials grid - the generator decides the structure from what the business is.
        </P>
        <P>Useful things to include:</P>
        <Bullets
          items={[
            'What the business does, and its name if it has one',
            'Who it is for - homeowners, agencies, patients, brides',
            'The tone you want: warm, clinical, editorial, playful',
            'Anything concrete - a short menu, three service tiers, five years in business',
          ]}
        />
        <Note>
          Generation is not a one-shot. Everything it produces is ordinary editable data, so the fastest route is
          usually a short prompt followed by a few corrections rather than one long specification.
        </Note>

        <H2 id="editor">The editor</H2>
        <P>The left rail holds four panels:</P>
        <Bullets
          items={[
            <>
              <strong className="font-semibold text-ink-950">Pages</strong> - add, rename, reorder and set the URL path
              and SEO title of each page.
            </>,
            <>
              <strong className="font-semibold text-ink-950">Sections</strong> - the running order of the current page.
              Select one to edit its fields, drag to reorder, hide one without deleting it.
            </>,
            <>
              <strong className="font-semibold text-ink-950">Assets</strong> - the project&rsquo;s image library.
            </>,
            <>
              <strong className="font-semibold text-ink-950">Theme</strong> - the brand kit: colours, typefaces, corner
              radius, button style, density, light or dark.
            </>,
          ]}
        />
        <P>
          The canvas renders the real site, not an approximation of it. Switching to tablet or mobile loads the page in
          a frame at that actual width, so the layout you see is the layout a phone gets - media queries included.
        </P>
        <P>
          Edits save automatically. Undo and redo cover every change, including the ones the copilot makes.
        </P>

        <H2 id="sections">Section library</H2>
        <P>
          Every page is a list of typed sections. There are {SECTION_TYPES.length}, each with its own fields and
          layout variants:
        </P>
        <div className="mt-6 overflow-hidden rounded-xl border border-ink-200">
          <table className="w-full border-collapse text-left">
            <tbody>
              {SECTION_TYPES.map((type) => (
                <tr key={type} className="border-b border-ink-100 last:border-0">
                  <th scope="row" className="w-[38%] px-4 py-3 align-top text-[14px] font-semibold text-ink-950">
                    {SECTION_META[type].label}
                  </th>
                  <td className="px-4 py-3 align-top text-[14px] leading-relaxed text-ink-600">
                    {SECTION_META[type].description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          Header and footer are site-wide: there is one of each, and a new page inherits them so navigation stays
          consistent.
        </P>

        <H2 id="copilot">The AI copilot</H2>
        <P>
          The copilot panel sits to the right of the canvas. It works at two scopes: the whole site, or the section you
          have selected. Scoping to a section keeps a request like &ldquo;make this shorter and warmer&rdquo; from
          touching anything else.
        </P>
        <P>
          It is not a text box that rewrites your site as HTML. It calls the same named operations the editor&rsquo;s own
          buttons call, so every change it makes is validated, undoable, and visible in the section list:
        </P>
        <div className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {DOCUMENT_TOOLS.map((tool) => (
            <p key={tool.name} className="font-mono text-[12px] text-ink-600">
              {tool.name}
            </p>
          ))}
          <p className="font-mono text-[12px] text-ink-600">deploy_project</p>
          <p className="font-mono text-[12px] text-ink-600">get_deployment_status</p>
        </div>
        <Note>
          This is the reason a generated site stays editable. The model produces structured content and calls
          operations; it never writes code that runs on a server, and it never hands you a page you cannot take apart.
        </Note>

        <H2 id="brand">Brand kit</H2>
        <P>
          A theme is one set of values - brand colour, heading and body typefaces, corner radius, button style, density,
          light or dark - applied through CSS variables. That is why a theme change is instant across every page, and
          why the exported site needs a single stylesheet.
        </P>
        <P>{THEME_PRESETS.length} starting points are included:</P>
        <Bullets items={THEME_PRESETS.map((preset) => <>{preset.name}</>)} />
        <P>Every value stays editable afterwards. A preset is a starting point, not a lock-in.</P>

        <H2 id="images">Images</H2>
        <P>
          The asset panel searches stock photography and adds the result to the project library. Sections that take an
          image pull from that library, or from any image URL you paste. Generated sites arrive with photography already
          in place, chosen to match the business described.
        </P>

        <H2 id="preview">Preview</H2>
        <P>
          Preview opens the site on its own isolated route, with no editor chrome and no studio navigation - the same
          markup that gets deployed. Use it to check a site the way a visitor sees it before publishing.
        </P>

        <H2 id="deploying">Deploying to your own Vercel account</H2>
        <P>
          A published site belongs to the person who made it, so it deploys into <em>your</em> Vercel account rather
          than ours. That is what lets you point a domain at it, read its analytics, and keep it if you ever stop using
          this studio.
        </P>

        <H3 id="connecting">Connecting your account</H3>
        <P>
          Open <strong className="font-semibold text-ink-950">Deploy</strong> in the editor and choose{' '}
          <strong className="font-semibold text-ink-950">Continue with Vercel</strong>. You approve the connection on
          vercel.com - for your personal account or for a team you belong to - and come straight back. If you have no
          Vercel account yet, creating one is free.
        </P>
        <P>
          Your access credential is encrypted before it is stored and is never shown back to you or to anyone else in
          your workspace; the dialog displays only the account name it belongs to. Disconnecting removes it. Sites you
          already published stay live in your account, because they were never in ours.
        </P>

        <H3 id="what-ships">What actually gets published</H3>
        <P>
          Plain HTML, one precompiled stylesheet, and nothing else. No framework, no build step, no server code. The
          only JavaScript is a short helper that turns the contact form into a <Mono>mailto:</Mono> compose window. The
          deploy dialog lists every file and its size before you publish.
        </P>
        <P>
          Because there is no runtime, the site is fast by construction and cannot break in the ways a generated
          application can.
        </P>

        <H3 id="build-status">Build status and your URL</H3>
        <P>
          The dialog follows the build to completion and shows the production URL when it is live, along with a link to
          the deployment in your own Vercel dashboard. Every deployment is listed in the project&rsquo;s history.
        </P>

        <H3 id="domains">Custom domains</H3>
        <P>
          Domains are attached in your Vercel dashboard, against the project the deployment created. Because you own
          the project, you do not need us in that loop.
        </P>

        <H2 id="limits">Current limits</H2>
        <P>Worth knowing before you plan around it:</P>
        <Bullets
          items={[
            <>
              The contact form composes an email through <Mono>mailto:</Mono>. There is no form backend, so nothing is
              stored and nothing needs a server.
            </>,
            'No e-commerce, memberships or logins on generated sites.',
            'No custom code blocks. Sections are typed, which is what keeps a generated site safe to edit and safe to publish.',
            'Blog posts are pages, not a CMS with a feed.',
          ]}
        />

        <H2 id="help">Getting help</H2>
        <P>
          <TextLink href="/support">Support</TextLink> has the ways to reach us and what to include so we can help
          quickly. For questions about the account you deploy into, Vercel&rsquo;s own{' '}
          <TextLink href="https://vercel.com/docs">documentation</TextLink> covers domains, analytics and billing.
        </P>
      </Article>

      <MarketingFooter />
    </div>
  );
}
