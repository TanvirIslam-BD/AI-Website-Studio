import { generateFromTemplate } from '@/lib/ai/template';
import { homePage } from '@/lib/website/document';
import { PageView, ThemeScope } from '@/components/website/renderer';

/**
 * A cluster of generated sites, for the hero.
 *
 * Three real documents from the generator, rendered through the real section
 * components and stacked with the middle one forward. The arrangement is the
 * one these product pages always use, and it earns its place here for a reason
 * beyond decoration: three at once shows range - different palettes, different
 * typefaces, different photography - which a single screenshot cannot, and range
 * is the actual claim.
 *
 * Deliberately not images. A picture of output would be indistinguishable from
 * art direction; this cannot flatter the product, because it *is* the product's
 * output. If generation regressed, this would visibly regress with it.
 *
 * The briefs are ones the offline template path answers with tailored copy - it
 * is deterministic, which is why it renders at build time - and they were chosen
 * to contrast: an image-led portfolio, a warm restaurant, a dark gym.
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

/** Rendered at desktop width, then scaled into a tall frame. */
const RENDER_WIDTH = 1280;

function SiteFrame({
  index,
  className,
  width,
}: {
  index: number;
  className: string;
  /** The frame's own width, which sets the scale of the page inside it. */
  width: number;
}) {
  const site = SITES[index];
  const page = homePage(site.document);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/12 bg-white shadow-pop ring-1 ring-black/40 ${className}`}
      style={{ width }}
    >
      {/*
        A rendered site carries its own headings, anchor ids and links, all of
        which would collide with the page hosting it. `decorative` drops the
        ids, `aria-hidden` keeps the headings out of the accessibility tree and
        `inert` keeps every link out of the tab order. The hero's own h1 is what
        describes this section.
      */}
      <div className="h-full overflow-hidden" aria-hidden inert>
        <div className="origin-top-left" style={{ width: RENDER_WIDTH, transform: `scale(${width / RENDER_WIDTH})` }}>
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
        Fixed heights rather than aspect ratios: each frame shows a *slice* of a
        full page, and the slice is the point - a taller frame simply shows more
        of the site.
      */}
      <div className="relative flex items-center justify-center">
        {/*
          Sized so the pages inside stay legible. At a third of this width the
          type renders as texture rather than content, and three rectangles of
          coloured noise make no argument at all - the frames have to be big
          enough that a visitor can see these are websites.
        */}
        <SiteFrame
          index={0}
          width={214}
          className="hidden h-[392px] -rotate-6 translate-x-10 opacity-95 sm:block"
        />
        <SiteFrame index={1} width={278} className="relative z-10 h-[464px]" />
        <SiteFrame
          index={2}
          width={214}
          className="hidden h-[392px] -translate-x-10 rotate-6 opacity-95 sm:block"
        />
      </div>
    </div>
  );
}
