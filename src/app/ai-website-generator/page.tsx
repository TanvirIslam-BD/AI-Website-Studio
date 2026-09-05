import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import { currentUser } from '@/lib/tenancy';
import { BRAND } from '@/lib/brand';
import { MarketingNav } from '@/components/marketing/nav';
import { RevealProvider } from '@/components/marketing/reveal';
import { MarketingFooter } from '@/components/marketing/closing';
import { Container, Section, SectionHeading } from '@/components/marketing/shell';
import { FaqStructuredData, PageStructuredData } from '@/components/seo/structured-data';

export const runtime = 'nodejs';

const PATH = '/ai-website-generator';

/**
 * The category page for "AI website generator".
 *
 * Written to answer the search rather than to rank for it. Someone typing that
 * phrase is usually deciding whether this class of tool can do what they need
 * at all - so the page defines the category first, says plainly what this
 * generator does and does not produce, and shows the real editor rather than
 * asserting that one exists.
 *
 * The home page sells; this explains. Keeping them different is what stops it
 * being a doorway page, which is both the guideline and the reason a thin
 * variant of the home page would be worth less than no page.
 */

export const metadata: Metadata = {
  title: 'AI Website Generator - Build a Full Website From a Prompt',
  description:
    'Generate a complete multi-page website from one description. Web Copilot AI Studio writes the pages, sections and copy, lets you edit visually or with an AI copilot, and publishes portable static HTML.',
  alternates: { canonical: PATH },
  openGraph: {
    type: 'website',
    url: PATH,
    title: `AI Website Generator | ${BRAND.name}`,
    description:
      'Describe a business and get a complete, editable, multi-page website. Edit it visually or with AI, then publish it as fast static HTML to your own hosting.',
  },
};

const STEPS = [
  {
    step: '01',
    title: 'Describe the website',
    body: 'One sentence is enough to start - "a neighbourhood sushi restaurant with a seasonal omakase menu". A longer brief covering your services, tone and audience produces a closer first draft.',
  },
  {
    step: '02',
    title: 'The generator writes the site',
    body: 'Not a template with your words dropped in. It chooses the pages, picks the sections each page needs, writes the copy for your business, selects photography and settles a brand kit of colours and typefaces.',
  },
  {
    step: '03',
    title: 'Edit what you disagree with',
    body: 'Every heading, image, link, colour and spacing value is a field in a visual editor. The AI copilot takes plain-language instructions and applies them as real, undoable edits.',
  },
  {
    step: '04',
    title: 'Publish it as your own',
    body: 'What ships is plain HTML and one stylesheet - no framework runtime, nothing to hydrate - deployed to your own Vercel account, under your domain.',
  },
];

const GENERATES = [
  ['Multiple pages', 'Home, about, services and contact, sharing a header, footer and brand kit - not one landing page.'],
  ['Structured sections', 'Heroes, feature grids, galleries, pricing tables, testimonials, FAQs and contact blocks, each a real object you can edit rather than a block of markup.'],
  ['Copy written for the business', 'Headlines, section copy and calls to action about what you actually do, not lorem ipsum and not a generic services page.'],
  ['A brand kit', 'A palette, heading and body typefaces, spacing and corner radius, applied across every page at once.'],
  ['Photography', 'On-topic imagery selected for the business, so the first draft is not full of grey placeholder boxes.'],
  ['Portable output', 'Static HTML and one stylesheet. No lock-in: the result runs on any static host.'],
];

const USE_CASES = [
  ['Small businesses', 'A credible site for a salon, studio, clinic or restaurant without a designer or a month of back-and-forth.'],
  ['Startups', 'A launch site the day the idea is worth showing, then edited as the positioning changes.'],
  ['Agencies', 'A first draft in minutes to react to in a client meeting, instead of a blank canvas and a fee estimate.'],
  ['Freelancers', 'A portfolio or service site that can be regenerated for each new client brief.'],
];

const FAQS = [
  {
    q: 'What is an AI website generator?',
    a: 'An AI website generator turns a written description of a business into a working website - pages, sections, copy and imagery - instead of asking you to assemble one from blocks or a template. The output is a site you edit and publish, not a wireframe or a mockup.',
  },
  {
    q: 'How does an AI website generator work?',
    a: 'It reads your description, decides which pages and sections the business needs, writes copy for each of them, chooses imagery and settles a visual theme. Web Copilot AI Studio stores the result as structured sections rather than generated markup, which is what makes every part of it editable afterwards.',
  },
  {
    q: 'How long does generating a website take?',
    a: 'Under a minute in normal use. You are then editing a finished draft rather than starting from an empty page, which is where most of the time in building a website usually goes.',
  },
  {
    q: 'Can I edit the website after it is generated?',
    a: 'Yes, and that is the point. Every heading, image, link, colour and spacing value is a field in the visual editor, and the AI copilot applies plain-language instructions as real edits you can undo. Nothing is locked because the AI wrote it.',
  },
  {
    q: 'Are AI-generated websites responsive?',
    a: 'Yes. The generated site is laid out with real CSS breakpoints, so it resolves properly at phone, tablet and desktop widths rather than being scaled down.',
  },
  {
    q: 'Do I own the website it generates?',
    a: 'Yes. It publishes to your own Vercel account under your domain, and what ships is plain HTML and one stylesheet with no framework runtime - so it can be moved to any static host.',
  },
];

const SHOTS = [
  { src: '/product/02-editor.webp', alt: 'The visual editor showing a generated website with its section list and inspector', caption: 'The visual editor, with every section of a generated site editable.' },
  { src: '/product/04-theme.webp', alt: 'The brand kit panel showing palette and typeface controls for a generated website', caption: 'The brand kit: palette, typefaces and spacing applied across every page.' },
];

export default async function AiWebsiteGeneratorPage() {
  const user = await currentUser();
  const signedIn = Boolean(user);
  const startHref = signedIn ? '/dashboard' : '/signin?mode=register';

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <RevealProvider />
      <PageStructuredData
        path={PATH}
        name="AI Website Generator"
        description={metadata.description as string}
        breadcrumbs={[{ name: 'Home', path: '/' }]}
      />
      <FaqStructuredData items={FAQS} path={PATH} />
      <MarketingNav signedIn={signedIn} tone="dark" />

      <main>
        <section className="relative isolate -mt-16 overflow-hidden bg-ink-950">
          <div className="absolute inset-0 -z-10" aria-hidden>
            <div className="studio-grid absolute inset-0 opacity-[0.14]" />
            <div className="grain absolute inset-0 opacity-40" />
          </div>

          <Container className="relative pb-24 pt-32 sm:pb-28 sm:pt-40">
            {/* Visible breadcrumbs, matching the BreadcrumbList above. */}
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-1.5 text-[12px] text-white/45">
                <li>
                  <Link href="/" className="focus-ring transition-colors hover:text-white/80">
                    Home
                  </Link>
                </li>
                <ChevronRight className="h-3 w-3" aria-hidden />
                <li aria-current="page" className="text-white/70">
                  AI website generator
                </li>
              </ol>
            </nav>

            <h1 className="max-w-3xl text-balance text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-[3.25rem]">
              AI website generator
            </h1>

            {/*
              A definition, first, in one sentence. It is what an answer engine
              can lift whole when asked what this is, and what a reader needs
              before any feature means anything.
            */}
            <p className="mt-7 max-w-2xl text-pretty text-[19px] font-medium leading-snug tracking-[-0.01em] text-white/85">
              Web Copilot AI Studio is an AI website generator: describe a business in a sentence and it produces a
              complete, editable, multi-page website you can publish.
            </p>

            <p className="mt-5 max-w-2xl text-pretty text-[15px] leading-relaxed text-white/55">
              It writes the pages, chooses the sections each one needs, writes copy about your business, picks
              photography and settles a brand kit. What you get is a finished first draft to argue with, not a blank
              canvas and a template gallery.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={startHref}
                className="focus-ring group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-white/90"
              >
                Start building free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/#how-it-works"
                className="focus-ring inline-flex h-12 items-center justify-center rounded-lg border border-white/20 px-6 text-[15px] font-medium text-white transition-colors hover:border-white/40"
              >
                See how it works
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {['No credit card', 'Your own hosting', 'Plain HTML output', 'No lock-in'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-[12px] text-white/50">
                  <span className="h-1 w-1 rounded-full bg-white/35" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <Section>
          <Container>
            <SectionHeading
              eyebrow="How it works"
              title="From a sentence to a website you own."
              body="Four steps, none of which require you to open a code editor."
            />
            <ol className="mt-14 grid gap-8 sm:grid-cols-2">
              {STEPS.map(({ step, title, body }, i) => (
                <li key={step} className="reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                  <p className="font-mono text-[11px] tracking-[0.2em] text-ink-400">{step}</p>
                  <h3 className="mt-2 text-[17px] font-semibold tracking-[-0.01em] text-ink-950">{title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-600">{body}</p>
                </li>
              ))}
            </ol>
          </Container>
        </Section>

        <Section tone="muted">
          <Container>
            <SectionHeading
              eyebrow="What it generates"
              title="A whole website, not a landing page."
              body="Everything below comes out of a single description, before you have edited anything."
            />
            <dl className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {GENERATES.map(([term, detail], i) => (
                <div key={term} className="reveal flex gap-3" style={{ transitionDelay: `${i * 50}ms` }}>
                  <Check className="mt-1 h-4 w-4 shrink-0 text-ink-400" strokeWidth={2.2} />
                  <div>
                    <dt className="text-[15px] font-semibold tracking-[-0.01em] text-ink-950">{term}</dt>
                    <dd className="mt-1.5 text-[13px] leading-relaxed text-ink-600">{detail}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Container>
        </Section>

        <Section>
          <Container>
            <SectionHeading
              eyebrow="After generation"
              title="Edit it visually, or just say what you want changed."
              body="Sites are stored as structured sections rather than generated markup, which is what makes every part of them editable."
            />
            <div className="mt-14 grid gap-8 lg:grid-cols-2">
              {SHOTS.map((shot, i) => (
                <figure key={shot.src} className="reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                  <div className="overflow-hidden rounded-xl border border-ink-200 shadow-lift">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      width={1280}
                      height={800}
                      sizes="(min-width: 1024px) 560px, 100vw"
                      className="h-auto w-full"
                    />
                  </div>
                  <figcaption className="mt-3 text-[12px] leading-relaxed text-ink-500">{shot.caption}</figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-10 text-center text-[14px] leading-relaxed text-ink-600">
              See{' '}
              <Link href="/#generated" className="focus-ring font-medium text-ink-950 underline underline-offset-4">
                real websites this generator produced
              </Link>
              , each one built from the brief printed beneath it, or read the{' '}
              <Link href="/docs" className="focus-ring font-medium text-ink-950 underline underline-offset-4">
                documentation on how generation works
              </Link>
              .
            </p>
          </Container>
        </Section>

        <Section tone="muted">
          <Container>
            <SectionHeading eyebrow="Who it is for" title="Built for people who need a site, not a project." />
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {USE_CASES.map(([who, why], i) => (
                <div key={who} className="reveal" style={{ transitionDelay: `${i * 50}ms` }}>
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-950">{who}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-600">{why}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <SectionHeading eyebrow="Questions" title="About generating websites with AI" />
            <div className="mx-auto mt-12 max-w-3xl divide-y divide-ink-200 border-y border-ink-200">
              {FAQS.map(({ q, a }) => (
                <details key={q} className="group">
                  <summary className="focus-ring flex cursor-pointer list-none items-start justify-between gap-4 py-5 text-[15px] font-medium text-ink-900">
                    <h3 className="text-[15px] font-medium">{q}</h3>
                    <span className="mt-0.5 shrink-0 text-ink-400 transition-transform duration-200 group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="pb-5 text-[14px] leading-relaxed text-ink-600">{a}</p>
                </details>
              ))}
            </div>
          </Container>
        </Section>

        <Section tone="dark">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-[2rem] font-semibold tracking-[-0.03em] text-white sm:text-[2.5rem]">
                Generate your first website free.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-400">
                One sentence in, a complete multi-page site out. No credit card, and the result is yours to host
                anywhere.
              </p>
              <Link
                href={startHref}
                className="focus-ring group mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-white/90"
              >
                Start building free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <p className="mt-8 text-[13px] text-ink-500">
                Also worth reading:{' '}
                <Link href="/#two-ways" className="focus-ring text-ink-300 underline underline-offset-4">
                  generating a site versus starting from a blank editor
                </Link>
                , and{' '}
                <Link href="/pricing" className="focus-ring text-ink-300 underline underline-offset-4">
                  what each plan includes
                </Link>
                .
              </p>
            </div>
          </Container>
        </Section>
      </main>

      <MarketingFooter />
    </div>
  );
}
