import { generateFromTemplate } from '@/lib/ai/template';
import { homePage } from '@/lib/website/document';
import { PageView, ThemeScope } from '@/components/website/renderer';

/**
 * A cluster of generated sites, for the hero.
 *
 * Three real documents from the generator, rendered through the real section
 * components and stacked with the middle one forward. Three at once shows range
 * - different palettes, typefaces and photography - which a single screenshot
 * cannot, and range is the actual claim.
 *
 * Deliberately not images. A picture of output would be indistinguishable from
 * art direction; this cannot flatter the product, because it *is* the product's
 * output. If generation regressed, this would visibly regress with it.
 *
 * The briefs are ones the offline template path answers with tailored copy - it
 * is deterministic, which is why it renders at build time - and they were chosen
 * to contrast: a salon in pink, an editorial portfolio, a dark gym.
 */

const BRIEFS = [
  'a boutique hair salon that specialises in colour and restorative treatments',
  'a modern website for a photography studio shooting weddings and portraits',
  'a personal training studio offering small-group coaching and nutrition plans',
];

const SITES = BRIEFS.map((brief) => {
  const site = generateFromTemplate(brief);
  return { brand: site.brand, document: site.document };
});

/** Rendered at desktop width, then scaled down into the frame. */
const RENDER_WIDTH = 1280;

/** Height of the browser bar above each page. */
const CHROME_HEIGHT = 22;

function hostFor(brand: string) {
  return `${brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.vercel.app`;
}

function SiteFrame({
  index,
  className,
  width,
  height,
}: {
  index: number;
  className: string;
  /** The frame's own width, which sets the scale of the page inside it. */
  width: number;
  height: number;
}) {
  const site = SITES[index];
  const page = homePage(site.document);
  const scale = width / RENDER_WIDTH;

  return (
    /**
     * `shrink-0` is load-bearing. These are flex children with an inline width,
     * and without it the row squeezed them narrower than declared while the page
     * inside stayed scaled for the declared width - so the right-hand ~20% of
     * every site was sliced off, which read as three cropped fragments rather
     * than three websites.
     */
    <div
      className={`shrink-0 overflow-hidden rounded-xl border border-white/12 bg-white shadow-pop ring-1 ring-black/40 ${className}`}
      style={{ width, height }}
    >
      {/*
        A browser bar, so the frame reads as a website at a glance rather than
        as a coloured rectangle. It also gives the composition a horizontal edge
        to sit against, which three bare rounded rectangles lacked.
      */}
      <div
        className="flex items-center gap-1.5 border-b border-black/10 bg-ink-100 px-2.5"
        style={{ height: CHROME_HEIGHT }}
      >
        <span className="flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-ink-300" />
          ))}
        </span>
        <span className="ml-0.5 truncate font-mono text-ink-400" style={{ fontSize: 7 }}>
          {hostFor(site.brand)}
        </span>
      </div>

      {/*
        A rendered site carries its own headings, anchor ids and links, all of
        which would collide with the page hosting it. `decorative` drops the
        ids, `aria-hidden` keeps the headings out of the accessibility tree and
        `inert` keeps every link out of the tab order. The hero's own h1 is what
        describes this section.
      */}
      <div className="overflow-hidden" style={{ height: height - CHROME_HEIGHT }} aria-hidden inert>
        <div className="origin-top-left" style={{ width: RENDER_WIDTH, transform: `scale(${scale})` }}>
          <ThemeScope theme={site.document.theme}>
            <PageView page={page} theme={site.document.theme} hrefFor={() => '#'} decorative />
          </ThemeScope>
        </div>
      </div>
    </div>
  );
}

export function HeroSites() {
  return (
    <div className="relative" aria-hidden>
      {/*
        A soft lift behind the cluster. The references this arrangement comes
        from put a saturated gradient here; the identity has no accent hue, so
        the glow is neutral and the colour in the composition comes from the
        generated sites themselves.
      */}
      <div
        className="absolute left-1/2 top-1/2 h-[500px] w-[660px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.22), transparent 70%)' }}
      />

      {/*
        Sized to the column it sits in rather than to a guess. The three frames
        plus their overlap have to fit roughly 560px at the widest layout, and
        the frames have to stay big enough that the pages inside read as pages -
        below about 180px the type becomes texture and three rectangles of
        coloured noise make no argument at all.
      */}
      <div className="relative flex items-center justify-center">
        <SiteFrame
          index={0}
          width={192}
          height={332}
          className="hidden translate-x-[72px] -rotate-6 opacity-95 sm:block"
        />
        <SiteFrame index={1} width={264} height={384} className="relative z-10" />
        <SiteFrame
          index={2}
          width={192}
          height={332}
          className="hidden -translate-x-[72px] rotate-6 opacity-95 sm:block"
        />
      </div>
    </div>
  );
}
