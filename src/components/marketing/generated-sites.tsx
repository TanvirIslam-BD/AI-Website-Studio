import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { generateFromTemplate } from '@/lib/ai/template';
import { homePage } from '@/lib/website/document';
import { PageView, ThemeScope } from '@/components/website/renderer';
import { Container, Section, SectionHeading } from './shell';
import { ShowcaseSlider } from './showcase-slider';

/**
 * A rail of complete generated homepages.
 *
 * Every card is a real document from the same generator the product runs,
 * rendered through the same section components that build a deployed site -
 * scrolled down the page rather than cropped at the hero, so what is on show is
 * a whole homepage instead of a promising first screen.
 *
 * That is the point of the section: anyone can put five attractive screenshots
 * in a row. These are generated at build time from the briefs printed on the
 * cards, so the gallery cannot drift from what the product actually produces -
 * if generation got worse, this would get worse with it.
 */

/**
 * Chosen for the topics the offline generator writes bespoke copy for.
 *
 * This renders at build time, which means the deterministic template path
 * rather than a model. That path only has tailored headlines for some topics -
 * the rest fall back to "does the work that moves your business", which is
 * exactly the generic filler this section exists to disprove. An EV-rental
 * brief, for instance, is detected as construction and comes out as a builder.
 *
 * So the briefs here are ones the template path answers well. The live product
 * is not limited this way; a real brief goes to the model.
 */
const BRIEFS = [
  { brief: 'a modern website for a photography studio shooting weddings and portraits', industry: 'Photography' },
  { brief: 'a neighbourhood sushi restaurant with a seasonal omakase menu', industry: 'Restaurant' },
  { brief: 'a personal training studio offering small-group coaching and nutrition plans', industry: 'Fitness' },
  { brief: 'a boutique hair salon that specialises in colour and restorative treatments', industry: 'Salon' },
  { brief: 'a dental practice offering gentle care for families', industry: 'Healthcare' },
  { brief: 'a law firm offering fixed-fee advice to small businesses', industry: 'Professional services' },
];

/**
 * Built once at module scope. `generateFromTemplate` is deterministic, so this
 * is the same work on every request and there is nothing to gain from repeating
 * it - the same reason the other showcase sections do it.
 */
const SITES = BRIEFS.map(({ brief, industry }) => {
  const site = generateFromTemplate(brief);
  return { brief, industry, brand: site.brand, document: site.document };
});

/** The width the pages are rendered at before being scaled into a card. */
const RENDER_WIDTH = 1280;

export function GeneratedSites({ signedIn }: { signedIn: boolean }) {
  return (
    <Section id="generated" tone="muted">
      <Container>
        <SectionHeading
          eyebrow="Generated, not designed"
          title="Real websites, built from one sentence."
          body="Each of these came out of the brief printed underneath it. Nothing was touched afterwards - this is the first draft the generator returns."
        />

        <div className="reveal mt-14">
          <ShowcaseSlider label="Example websites generated from a brief">
            {SITES.map(({ brief, industry, brand, document }) => {
              const page = homePage(document);

              return (
                <article
                  key={brief}
                  className="w-[268px] shrink-0 snap-start sm:w-[300px]"
                >
                  <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lift transition-shadow duration-200 hover:shadow-pop">
                    {/* Chrome, so a scaled page reads as a site and not a poster. */}
                    <div className="flex items-center gap-1.5 border-b border-ink-200 bg-ink-50 px-3 py-2">
                      <span className="h-2 w-2 rounded-full bg-ink-300" />
                      <span className="h-2 w-2 rounded-full bg-ink-300" />
                      <span className="h-2 w-2 rounded-full bg-ink-300" />
                      <span className="ml-1.5 truncate font-mono text-[9px] text-ink-400">
                        {brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.vercel.app
                      </span>
                    </div>

                    {/*
                      A real rendered site carries its own h1, anchor ids and
                      links, all of which would collide with this page. The
                      `decorative` prop suppresses the ids, `aria-hidden` keeps
                      the duplicate headings out of the accessibility tree, and
                      `inert` stops the links taking focus. The card's own text
                      below is what actually describes it.
                    */}
                    <div className="h-[380px] overflow-hidden bg-white sm:h-[440px]" aria-hidden inert>
                      <div
                        className="origin-top-left"
                        style={{
                          width: RENDER_WIDTH,
                          // Scaled to the card, so the whole page width is
                          // visible rather than a crop of its left edge.
                          transform: `scale(${268 / RENDER_WIDTH})`,
                        }}
                      >
                        <ThemeScope theme={document.theme}>
                          <PageView page={page} theme={document.theme} hrefFor={() => '#'} decorative />
                        </ThemeScope>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 px-0.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">{industry}</p>
                    <p className="mt-1.5 text-[14px] font-semibold tracking-[-0.01em] text-ink-950">{brand}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-500">&ldquo;{brief}&rdquo;</p>
                  </div>
                </article>
              );
            })}
          </ShowcaseSlider>
        </div>

        <div className="reveal mt-10 flex flex-col items-center gap-3 text-center">
          <Link
            href={signedIn ? '/dashboard' : '/signin?mode=register'}
            className="focus-ring group inline-flex h-11 items-center gap-2 rounded-lg bg-ink-950 px-6 text-[14px] font-medium text-white transition-colors hover:bg-ink-800"
          >
            Generate yours
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <p className="text-[12px] text-ink-400">Free to start. No credit card.</p>
        </div>
      </Container>
    </Section>
  );
}
