import { ArrowDown, ArrowUp, Image as ImageIcon, MousePointer2, Square, Type } from 'lucide-react';
import { generateFromTemplate } from '@/lib/ai/template';
import { homePage } from '@/lib/website/document';
import { PageView, ThemeScope } from '@/components/website/renderer';
import { Container, Section, SectionHeading } from './shell';

/**
 * Two ways to build the same page.
 *
 * The argument the rest of the page never quite makes: not that a drag-and-drop
 * builder is bad - it is how most of these are made, and the same controls are
 * in this product's inspector - but that it starts you on an empty canvas. The
 * difference worth paying for is where you begin.
 *
 * So the comparison is drawn honestly. The right-hand column is a generic block
 * editor, not a caricature and not an imitation of any particular product, and
 * it ends at the same website. What differs is the number of decisions between
 * the brief and that result.
 *
 * The left column's output is a real generated document rendered through the
 * real section components, for the same reason every other showcase here is:
 * the page should not be able to promise output the product cannot produce.
 */

const BRIEF = 'a modern website for a photography studio shooting weddings and portraits';
const RESULT = generateFromTemplate(BRIEF);
const RENDER_WIDTH = 1280;

/** The palette a block editor puts on the left. Deliberately generic. */
const BLOCKS = [
  { icon: Type, label: 'Text' },
  { icon: ImageIcon, label: 'Image' },
  { icon: Square, label: 'Button' },
  { icon: MousePointer2, label: 'Section' },
];

/** The inspector a block editor puts on the right, once something is selected. */
const CONTROLS = [
  { label: 'Font', value: 'Playfair Display' },
  { label: 'Size', value: '32' },
  { label: 'Weight', value: 'Semibold' },
  { label: 'Align', value: 'Left' },
];

export function TwoWays() {
  const page = homePage(RESULT.document);

  return (
    <Section id="two-ways" className="overflow-hidden">
      {/*
        A quiet backdrop rather than the coloured gradients this layout usually
        gets: the identity has no accent hue, so depth here comes from a grid
        that dissolves and a soft lift behind the panels.
      */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-[#fafafa]" />
        <div
          className="studio-grid absolute inset-0 opacity-70"
          style={{
            maskImage: 'radial-gradient(80% 60% at 50% 40%, black 10%, transparent 78%)',
            WebkitMaskImage: 'radial-gradient(80% 60% at 50% 40%, black 10%, transparent 78%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(60% 50% at 50% 35%, rgba(255,255,255,0.95), rgba(255,255,255,0) 72%)' }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
      </div>

      <Container>
        <SectionHeading
          eyebrow="Two ways to build"
          title="Same website. Different starting line."
          body="A block editor is a good tool - this product ships one too. The difference is whether you open it on an empty canvas or on a finished draft."
        />

        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-2">
          {/* ---------------------------------------------------------- AI */}
          <article className="reveal relative flex flex-col overflow-hidden rounded-2xl border border-ink-900 bg-ink-950 p-5 shadow-pop sm:p-6">
            <header className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white">
                With Web Copilot
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">1 step</span>
            </header>

            {/* The brief, as it is actually typed. */}
            <div className="mt-6 rounded-xl border border-white/12 bg-white/5 p-3.5">
              <p className="text-[13px] leading-relaxed text-white/90">{BRIEF}</p>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/35">brief</span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-950">
                  Generate <ArrowUp className="h-3 w-3" />
                </span>
              </div>
            </div>

            <div className="my-4 flex justify-center">
              <ArrowDown className="h-4 w-4 text-white/30" aria-hidden />
            </div>

            {/*
              The finished page. A real render, so this cannot flatter the
              product - it is the same output the generator returns.

              A rendered site brings its own headings, ids and links, all of
              which would collide with this page: `decorative` drops the ids,
              `aria-hidden` keeps the headings out of the accessibility tree and
              `inert` keeps every link out of the tab order.
            */}
            <figure className="mt-auto overflow-hidden rounded-xl border border-white/12 bg-white">
              <div className="flex items-center gap-1.5 border-b border-ink-200 bg-ink-50 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-ink-300" />
                <span className="h-2 w-2 rounded-full bg-ink-300" />
                <span className="h-2 w-2 rounded-full bg-ink-300" />
                <span className="ml-1.5 font-mono text-[9px] text-ink-400">aperture-light.vercel.app</span>
              </div>
              <div className="h-[236px] overflow-hidden sm:h-[268px]" aria-hidden inert>
                <div
                  className="origin-top-left"
                  style={{ width: RENDER_WIDTH, transform: `scale(${520 / RENDER_WIDTH})` }}
                >
                  <ThemeScope theme={RESULT.document.theme}>
                    <PageView page={page} theme={RESULT.document.theme} hrefFor={() => '#'} decorative />
                  </ThemeScope>
                </div>
              </div>
            </figure>

            <p className="mt-4 text-[13px] leading-relaxed text-white/55">
              A complete draft — pages, copy, imagery and a brand kit — then edit anything by clicking it, or by asking.
            </p>
          </article>

          {/* ------------------------------------------------- block editor */}
          <article className="reveal relative flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white p-5 shadow-lift sm:p-6">
            <header className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-ink-100 px-3 py-1.5 text-[12px] font-semibold text-ink-800">
                A block editor
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">every decision</span>
            </header>

            {/* Palette, canvas and inspector: the shape every one of these has. */}
            <div className="mt-6 grid gap-2.5 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
              <ul className="flex gap-2 sm:flex-col">
                {BLOCKS.map((block) => (
                  <li
                    key={block.label}
                    className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-ink-50 px-2.5 py-2 text-[11px] text-ink-600"
                  >
                    <block.icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                    <span className="hidden sm:inline">{block.label}</span>
                  </li>
                ))}
              </ul>

              <div className="rounded-lg border border-dashed border-ink-300 bg-ink-50/60 p-3">
                {/* A selected heading, with the handles that implies. */}
                <div className="relative rounded-md bg-white px-2.5 py-2 ring-2 ring-ink-900">
                  <p className="text-[13px] font-semibold leading-tight text-ink-900">
                    Photographs that
                    <br />
                    feel like you
                  </p>
                  {['-left-1 -top-1', '-right-1 -top-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((pos) => (
                    <span key={pos} className={`absolute ${pos} h-2 w-2 rounded-[1px] bg-white ring-1 ring-ink-900`} />
                  ))}
                </div>
                <div className="mt-2.5 grid h-14 place-items-center rounded-md border border-dashed border-ink-300 text-[11px] text-ink-400">
                  Drop a block here
                </div>
                <div className="mt-2.5 h-2 w-2/3 rounded-full bg-ink-200" />
                <div className="mt-1.5 h-2 w-1/2 rounded-full bg-ink-200" />
              </div>

              <dl className="w-full min-w-0 rounded-lg border border-ink-200 bg-white p-2.5 sm:w-[124px]">
                {CONTROLS.map((control) => (
                  <div key={control.label} className="mb-2 last:mb-0">
                    <dt className="font-mono text-[9px] uppercase tracking-wider text-ink-400">{control.label}</dt>
                    <dd className="mt-0.5 truncate rounded border border-ink-200 px-1.5 py-1 text-[10px] text-ink-700">
                      {control.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="mt-auto pt-6 text-[13px] leading-relaxed text-ink-500">
              The same controls, reached one block at a time — and a blank canvas until you have placed every one of
              them yourself.
            </p>
          </article>
        </div>
      </Container>
    </Section>
  );
}
