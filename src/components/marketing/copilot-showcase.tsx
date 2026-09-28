import { ArrowUp, Check } from 'lucide-react';
import { OPERATION_NAMES } from '@/lib/website/operations';
import { Container, Section, SectionHeading } from './shell';
import { MOCK, MockImg } from './mock-content';

/**
 * The copilot section.
 *
 * The differentiator is narrow and worth stating plainly: it edits the
 * selected section by calling validated operations, rather than regenerating
 * the project. The operation list is imported from the operations layer, so
 * this section cannot advertise a tool that does not exist.
 */

const CAPABILITIES = [
  'Rewrite copy',
  'Change layout',
  'Restyle sections',
  'Add sections',
  'Move sections',
  'Change imagery',
  'Update theme',
  'Improve conversion',
];

export function CopilotShowcase() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          dark
          eyebrow="AI Copilot"
          title="Your website has a *copilot.*"
          body="Describe the change. Web Copilot makes it."
        />

        <div className="reveal mt-14 overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
          <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <PreviewPane />
            <CopilotPane />
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div>
            <p className="text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
              It edits your site. It doesn&rsquo;t regenerate it.
            </p>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-400">
              Changes arrive as a small list of operations against the document, validated server-side before anything
              is applied. A rejected call is corrected once, with the exact reason - never guessed at.
            </p>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
              {OPERATION_NAMES.length} operations
            </p>
            <p className="mt-2 font-mono text-[11px] leading-relaxed text-ink-400">{OPERATION_NAMES.join('  ·  ')}</p>
          </div>

          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {CAPABILITIES.map((capability) => (
              <li key={capability} className="flex items-center gap-2 text-[13px] text-ink-300">
                <Check className="h-3.5 w-3.5 shrink-0 text-white" strokeWidth={2.4} />
                {capability}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

/** The website being edited, mid-change. */
function PreviewPane() {
  return (
    <div className="border-b border-white/10 bg-ink-950/40 p-5 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2 pb-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">preview</span>
        <span className="ml-auto flex gap-1">
          {['Desktop', 'Tablet', 'Mobile'].map((device, i) => (
            <span
              key={device}
              className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${
                i === 0 ? 'bg-white/15 text-white' : 'text-ink-500'
              }`}
            >
              {device}
            </span>
          ))}
        </span>
      </div>

      <div className="overflow-hidden rounded-lg bg-white">
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5">
          <span className="text-[10px] font-bold tracking-tight text-ink-950">{MOCK.brand}</span>
          <span className="hidden gap-3 sm:flex">
            {MOCK.nav.map((item) => (
              <span key={item} className="text-[7px] text-ink-500">
                {item}
              </span>
            ))}
          </span>
          <span className="rounded bg-ink-950 px-2 py-0.5 text-[7px] text-white">{MOCK.cta}</span>
        </div>

        {/* The selected section, outlined as the editor does. */}
        <div className="relative ring-2 ring-inset ring-ink-950">
          <span className="absolute left-2 top-2 z-10 rounded bg-ink-950 px-1.5 py-0.5 text-[7px] font-semibold text-white">
            Hero
          </span>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] items-center gap-4 px-5 py-6">
            <div>
              <p className="text-[6px] font-semibold uppercase tracking-[0.14em] text-ink-400">{MOCK.eyebrow}</p>
              <p
                className="mt-1.5 text-[17px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink-950"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {MOCK.headline}
              </p>
              <p className="mt-2 text-[7px] leading-[1.6] text-ink-500">{MOCK.body}</p>
              <span className="mt-3 inline-flex items-center gap-1.5">
                <span className="rounded bg-ink-950 px-2 py-1 text-[7px] font-medium text-white">Book a session</span>
                <span className="rounded border border-ink-300 px-2 py-1 text-[7px] text-ink-600">See our work</span>
              </span>
            </div>
            <MockImg src={MOCK.hero(520)} ratio="4/5" className="w-full rounded" />
          </div>
        </div>

        <div className="border-t border-ink-100 px-5 py-4">
          <p className="text-center text-[7px] font-semibold uppercase tracking-[0.14em] text-ink-400">Selected work</p>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {MOCK.gallery(3, 260).map((src) => (
              <MockImg key={src} src={src} ratio="1/1" className="w-full rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The copilot exchange that produced it. */
function CopilotPane() {
  return (
    <div className="flex flex-col p-5">
      <p className="pb-4 font-mono text-[10px] uppercase tracking-wider text-ink-500">ai copilot</p>

      <div className="flex-1 space-y-3">
        <p className="ml-auto w-fit max-w-[88%] rounded-xl bg-white px-3 py-2 text-[12px] leading-snug text-ink-950">
          Make the hero more premium and increase the CTA contrast.
        </p>

        <div className="w-fit max-w-[94%] rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
          <p className="text-[12px] leading-relaxed text-ink-200">
            Updated the hero layout, typography and CTA styling.
          </p>
          <div className="mt-2.5 space-y-1 border-t border-white/10 pt-2.5">
            {[
              'update_section — variant, heading',
              'update_theme — headingFont, density',
            ].map((op) => (
              <p key={op} className="flex items-center gap-1.5 font-mono text-[9px] text-ink-400">
                <Check className="h-2.5 w-2.5 shrink-0 text-white" strokeWidth={3} />
                {op}
              </p>
            ))}
          </div>
        </div>

        <p className="w-fit rounded-lg bg-white/[0.04] px-2.5 py-1.5 font-mono text-[9px] text-ink-500">
          1 section changed · undo available
        </p>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/10 bg-ink-950/50 px-3 py-2.5">
        <span className="flex-1 text-[12px] text-ink-500">Ask for a change...</span>
        <span className="grid h-6 w-6 place-items-center rounded-md bg-white text-ink-950">
          <ArrowUp className="h-3 w-3" strokeWidth={2.5} />
        </span>
      </div>
    </div>
  );
}
