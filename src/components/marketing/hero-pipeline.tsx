import { ArrowRight, Check, CornerDownLeft } from 'lucide-react';
import { MOCK, MockImg } from './mock-content';

/**
 * The workflow, as three panels: prompt, generated structure, deployed site.
 *
 * This is the page's most important visual. Its job is to make the product
 * legible in a few seconds - a visitor should read "I describe a site, it gets
 * built, it goes live" without any body copy. Built from real UI rather than
 * illustration, monochrome, depth from borders rather than shadow haze.
 */

const STRUCTURE = [
  { label: 'Header', detail: 'nav · logo · CTA' },
  { label: 'Hero', detail: 'split · image' },
  { label: 'Gallery', detail: '6 images' },
  { label: 'Testimonials', detail: '3 quotes' },
  { label: 'Contact', detail: 'form · details' },
  { label: 'Footer', detail: 'columns' },
];

const BUILD_STEPS = ['Pages generated', 'HTML generated', 'Deployed to Vercel'];

export function HeroPipeline() {
  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,0.86fr)_minmax(0,1.22fr)]">
      <Panel step="01" title="Describe it">
        <div className="rounded-lg border border-ink-200 bg-white p-3.5">
          <p className="text-[13px] leading-relaxed text-ink-800">
            Create a modern website for a premium photography studio.
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-2.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400">prompt</span>
            <span className="inline-flex items-center gap-1 rounded bg-ink-950 px-1.5 py-1 text-[10px] font-medium text-white">
              <CornerDownLeft className="h-2.5 w-2.5" /> Generate
            </span>
          </div>
        </div>
        <ul className="mt-3 space-y-1.5">
          {['Brand name and voice', 'Palette and typeface', 'Pages and sections'].map((item) => (
            <li key={item} className="flex items-center gap-2 text-[11px] text-ink-500">
              <Check className="h-3 w-3 shrink-0 text-ink-900" strokeWidth={2.5} />
              {item}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel step="02" title="Structured, not generated">
        <ul className="space-y-1">
          {STRUCTURE.map((row, i) => (
            <li
              key={row.label}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
                i === 1 ? 'bg-ink-950 text-white' : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200'
              }`}
            >
              <span
                className={`grid h-4 w-4 shrink-0 place-items-center rounded text-[9px] font-bold ${
                  i === 1 ? 'bg-white/20 text-white' : 'bg-ink-100 text-ink-500'
                }`}
              >
                {i + 1}
              </span>
              <span className="text-[11px] font-medium">{row.label}</span>
              <span className={`ml-auto font-mono text-[9px] ${i === 1 ? 'text-white/60' : 'text-ink-400'}`}>
                {row.detail}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 font-mono text-[10px] leading-relaxed text-ink-400">
          4 pages · 27 sections · editable
        </p>
      </Panel>

      <Panel step="03" title="Live on your domain">
        <BrowserPreview />
        <div className="mt-3 space-y-1.5">
          {BUILD_STEPS.map((step) => (
            <p key={step} className="flex items-center gap-2 font-mono text-[10px] text-ink-500">
              <Check className="h-3 w-3 shrink-0 text-ink-900" strokeWidth={2.5} />
              {step}
            </p>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Panel({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <figure className="relative flex flex-col rounded-xl border border-ink-200 bg-[#fcfcfc] p-4 shadow-lift">
      <figcaption className="mb-3.5 flex items-baseline gap-2">
        <span className="font-mono text-[10px] font-semibold tracking-wider text-ink-400">{step}</span>
        <span className="text-[12px] font-semibold tracking-[-0.01em] text-ink-900">{title}</span>
      </figcaption>
      <div className="flex flex-1 flex-col">{children}</div>

      {/* Flow connector. Horizontal between columns, hidden on the last panel
          and flipped to vertical once the panels stack. */}
      <span
        className="absolute -bottom-3 left-1/2 z-10 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full border border-ink-200 bg-white text-ink-400 last:hidden lg:-right-[14px] lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-x-0 lg:-translate-y-1/2"
        aria-hidden
      >
        <ArrowRight className="h-3 w-3 rotate-90 lg:rotate-0" />
      </span>
    </figure>
  );
}

/** The deployed result, in browser chrome, using real content. */
function BrowserPreview() {
  return (
    <div className="overflow-hidden rounded-lg border border-ink-200 bg-white">
      <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50 px-2.5 py-1.5">
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
        </span>
        <span className="mx-auto flex items-center gap-1 font-mono text-[8px] text-ink-500">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-900" />
          {MOCK.domain}
        </span>
      </div>

      <div className="px-3 pb-3 pt-2.5">
        <div className="flex items-center justify-between border-b border-ink-100 pb-2">
          <span className="text-[8px] font-bold tracking-tight text-ink-900">{MOCK.brand}</span>
          <span className="hidden gap-1.5 sm:flex">
            {MOCK.nav.slice(0, 3).map((item) => (
              <span key={item} className="text-[6px] text-ink-500">
                {item}
              </span>
            ))}
          </span>
          <span className="rounded bg-ink-950 px-1.5 py-0.5 text-[6px] text-white">{MOCK.cta}</span>
        </div>

        <div className="grid grid-cols-2 items-center gap-2.5 py-3">
          <div>
            <p className="text-[5px] font-semibold uppercase tracking-[0.12em] text-ink-400">{MOCK.eyebrow}</p>
            <p
              className="mt-1 text-[10px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-950"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {MOCK.headline}
            </p>
            <p className="mt-1 text-[5px] leading-[1.5] text-ink-500">{MOCK.body}</p>
            <span className="mt-2 inline-flex items-center gap-1">
              <span className="rounded bg-ink-950 px-1.5 py-[3px] text-[5px] text-white">Book a session</span>
              <span className="rounded border border-ink-300 px-1.5 py-[3px] text-[5px] text-ink-600">See work</span>
            </span>
          </div>
          <MockImg src={MOCK.hero(420)} ratio="4/3" className="w-full rounded" />
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {MOCK.gallery(3, 200).map((src) => (
            <MockImg key={src} src={src} ratio="1/1" className="w-full rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
