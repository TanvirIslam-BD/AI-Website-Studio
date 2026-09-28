import { Check, CornerDownLeft, Loader2, Sparkles } from 'lucide-react';
import { Container, Section, SectionHeading } from './shell';
import { MOCK, MockImg } from './mock-content';

/**
 * The workflow as a timeline.
 *
 * Each step alternates side on desktop and carries its own small UI study, so
 * the four stages read as one continuous flow rather than four unrelated
 * cards. The visuals reuse the real interface language - section lists, a
 * copilot exchange, a build log - so nothing here promises a screen the
 * product does not have.
 */

const STEPS = [
  {
    n: '01',
    title: 'Describe the business',
    body: 'Tell Web Copilot what you are building. One sentence is enough - it plans the pages, writes the copy, picks on-topic imagery and chooses a brand kit that fits the trade.',
    visual: 'prompt' as const,
  },
  {
    n: '02',
    title: 'Edit what you see',
    body: 'Click any section to change content, images, layouts or styles. Desktop, tablet and mobile previews render at real breakpoints, so what you see is what deploys.',
    visual: 'editor' as const,
  },
  {
    n: '03',
    title: 'Direct the Copilot',
    body: 'Tell the Copilot what to change in plain language. It edits the section you have selected by calling validated operations - it does not regenerate the site around you.',
    visual: 'copilot' as const,
  },
  {
    n: '04',
    title: 'Deploy it',
    body: 'Build static HTML and ship it straight to your own Vercel account. Watch the build, get the production URL, redeploy whenever you change something.',
    visual: 'deploy' as const,
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" tone="muted">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Four steps, and the last one is *live*"
          body="No template picking, no blank canvas, no drag-and-drop archaeology."
        />

        <ol className="mt-16 space-y-14 lg:space-y-20">
          {STEPS.map((step, i) => (
            <li
              key={step.n}
              className="reveal relative grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
            >
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] font-semibold tracking-wider text-ink-400">STEP {step.n}</span>
                  <span className="h-px flex-1 bg-ink-200 lg:max-w-[80px]" />
                </div>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.025em] text-ink-950 sm:text-[28px]">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-500">{step.body}</p>
              </div>

              <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                <StepVisual kind={step.visual} />
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

function Card({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <figure className="rounded-xl border border-ink-200 bg-white p-4 shadow-lift">
      <figcaption className="mb-3 font-mono text-[10px] uppercase tracking-wider text-ink-400">{label}</figcaption>
      {children}
    </figure>
  );
}

function StepVisual({ kind }: { kind: 'prompt' | 'editor' | 'copilot' | 'deploy' }) {
  if (kind === 'prompt') {
    return (
      <Card label="new project">
        <div className="rounded-lg border border-ink-200 p-3.5">
          <p className="text-[13px] leading-relaxed text-ink-800">
            A boutique hair salon that specialises in colour.
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-2.5">
            <span className="font-mono text-[10px] text-ink-400">Cmd + Enter</span>
            <span className="inline-flex items-center gap-1.5 rounded bg-ink-950 px-2 py-1 text-[10px] font-medium text-white">
              <CornerDownLeft className="h-2.5 w-2.5" /> Generate website
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2">
          <Loader2 className="h-3 w-3 animate-spin text-ink-500" />
          <span className="font-mono text-[10px] text-ink-500">Planning pages, writing copy, choosing a brand kit</span>
        </div>
      </Card>
    );
  }

  if (kind === 'editor') {
    return (
      <Card label="visual editor">
        <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-2">
          <ul className="space-y-1">
            {['Header', 'Hero', 'Gallery', 'Pricing', 'Footer'].map((name, i) => (
              <li
                key={name}
                className={`rounded px-1.5 py-1 text-[10px] font-medium ${
                  i === 2 ? 'bg-ink-950 text-white' : 'bg-ink-50 text-ink-600'
                }`}
              >
                {name}
              </li>
            ))}
          </ul>
          <div className="rounded-lg border border-ink-200 p-2.5">
            <p className="text-center text-[7px] font-semibold uppercase tracking-[0.14em] text-ink-400">
              Selected work
            </p>
            <div className="mt-2 grid grid-cols-3 gap-1.5 rounded ring-2 ring-ink-950 ring-offset-2">
              {MOCK.gallery(3, 200).concat(MOCK.gallery(3, 200)).map((src, i) => (
                <MockImg key={i} src={src} ratio="1/1" className="w-full rounded-sm" />
              ))}
            </div>
            <p className="mt-2.5 text-center font-mono text-[9px] text-ink-400">gallery · 6 images · grid</p>
          </div>
        </div>
      </Card>
    );
  }

  if (kind === 'copilot') {
    return (
      <Card label="ai copilot">
        <div className="space-y-2">
          <p className="ml-auto w-fit max-w-[85%] rounded-lg bg-ink-950 px-2.5 py-1.5 text-[11px] leading-snug text-white">
            Make this section more premium
          </p>
          <div className="w-fit max-w-[92%] rounded-lg border border-ink-200 px-2.5 py-2">
            <p className="text-[11px] leading-snug text-ink-700">
              Switched to a serif display face, opened up the spacing and tightened the copy.
            </p>
            <div className="mt-2 space-y-1 border-t border-ink-100 pt-2">
              {['update_section', 'update_theme'].map((op) => (
                <p key={op} className="flex items-center gap-1.5 font-mono text-[9px] text-ink-500">
                  <Check className="h-2.5 w-2.5 text-ink-900" strokeWidth={3} />
                  {op}
                </p>
              ))}
            </div>
          </div>
          <p className="flex items-center gap-1.5 pt-1 text-[10px] text-ink-400">
            <Sparkles className="h-3 w-3" /> One section changed. Everything else untouched.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card label="deployment">
      <div className="space-y-1.5 font-mono text-[10px]">
        {['Pages generated', 'Assets optimised', 'HTML generated', 'Sitemap generated', 'robots.txt generated'].map(
          (line) => (
            <p key={line} className="flex items-center gap-2 text-ink-600">
              <Check className="h-3 w-3 shrink-0 text-ink-900" strokeWidth={2.5} />
              {line}
            </p>
          ),
        )}
      </div>
      <div className="mt-3 overflow-hidden rounded-lg bg-ink-950">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span>
            <span className="block font-mono text-[9px] uppercase tracking-wider text-white/50">Live</span>
            <span className="mt-0.5 block font-mono text-[11px] text-white">{MOCK.domain}</span>
          </span>
          <span className="rounded bg-white px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-ink-950">
            200
          </span>
        </div>
        <div className="grid grid-cols-3 gap-px bg-white/10">
          {MOCK.gallery(3, 200).map((src) => (
            <MockImg key={src} src={src} ratio="16/10" className="w-full" />
          ))}
        </div>
      </div>
    </Card>
  );
}
