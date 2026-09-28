import { Container, Section, SectionHeading } from './shell';

/**
 * One generated site at three viewport widths.
 *
 * The page claims real breakpoints in several places and never shows them. This
 * shows them, and doing it honestly is the whole difficulty: CSS media queries
 * resolve against the layout viewport, so a 390px-wide `div` scaled down still
 * matches `lg:` and would render the desktop layout at phone size. A mock-up
 * like that is a picture of the claim rather than evidence for it.
 *
 * Each frame is therefore a real iframe at a real device width, where the
 * breakpoints have their true values - the same reasoning the editor canvas
 * uses, and for the same reason (components/editor/canvas-iframe.tsx).
 *
 * The document inside is built by `renderPageHtml`, the function that builds
 * deployed sites. Not a re-implementation: the same one. It is served from
 * /showcase rather than inlined into each frame, because three copies escaped
 * into `srcDoc` attributes took this page from 220kB compressed to 990kB. At a
 * URL the browser fetches it once and reuses it for all three.
 */

/**
 * The example site's page background, so an unloaded frame matches it.
 *
 * Read from the document `/showcase` actually serves, and it has to change with
 * the brief there - a placeholder left on the previous site's colour flashes
 * the wrong ground before each frame loads.
 */
const SITE_SURFACE = '#0a1633';

/** Real device widths, so the breakpoints inside resolve the way they will in use. */
const SCREENS = [
  { label: 'Desktop', width: 1280, height: 820, scale: 0.3 },
  { label: 'Tablet', width: 834, height: 760, scale: 0.29 },
  { label: 'Phone', width: 390, height: 680, scale: 0.36 },
] as const;

export function EveryScreen() {
  return (
    <Section id="every-screen" tone="dark">
      <Container>
        <SectionHeading
          dark
          eyebrow="Every screen"
          title="One site. *Every width.*"
          body="Not three mock-ups at different sizes - the same page, rendered three times at real device widths, so each breakpoint resolves the way it will for a visitor."
        />

        <div className="reveal mt-14 flex flex-wrap items-end justify-center gap-8 sm:gap-12">
          {SCREENS.map((screen) => (
            <figure key={screen.label} className="flex flex-col items-center">
              <div
                className="overflow-hidden rounded-xl border border-white/12 shadow-pop"
                style={{
                  width: screen.width * screen.scale,
                  height: screen.height * screen.scale,
                  // The example site's own ground, so a frame that has not
                  // loaded yet is the right colour rather than a white flash
                  // against the dark band.
                  backgroundColor: SITE_SURFACE,
                }}
              >
                {/*
                  Sized to the real width first and only then scaled, so the
                  layout is decided at `screen.width` rather than at the size it
                  ends up drawn.

                  Sandboxed with no permissions granted at all, lazy so the
                  requests wait until the section is approached, and out of the
                  tab order and the accessibility tree - it is a picture that
                  happens to be live, and the caption is what describes it.
                */}
                <iframe
                  src="/showcase"
                  title={`Example site at ${screen.width} pixels wide`}
                  loading="lazy"
                  sandbox=""
                  scrolling="no"
                  tabIndex={-1}
                  aria-hidden
                  style={{
                    width: screen.width,
                    height: screen.height,
                    transform: `scale(${screen.scale})`,
                    transformOrigin: 'top left',
                    border: 0,
                    pointerEvents: 'none',
                  }}
                />
              </div>

              <figcaption className="mt-3.5 text-center">
                <p className="text-[13px] font-semibold tracking-[-0.01em] text-white">{screen.label}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
                  {screen.width}px
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="reveal mt-12 text-center text-[13px] leading-relaxed text-ink-400">
          The same document you edit, rendered by the same code that builds the deployed site.
        </p>
      </Container>
    </Section>
  );
}
