import { Lock, MousePointer2 } from 'lucide-react';
import { generateFromTemplate } from '@/lib/ai/template';
import { THEME_PRESETS, themeSchema } from '@/lib/website/theme';
import { Band, Container, Heading, SiteRender, hostFor } from './primitives';

/**
 * Generated output, in a slow continuous reel.
 *
 * Every card is a document from the generator rendered live through the real
 * section components, captioned with the brief it came from. These briefs are
 * ones the offline template path answers with tailored copy - it is
 * deterministic, which is why this can render at build time. A live brief goes
 * to the model instead.
 */
/**
 * Each brief is paired with one of the built-in brand kits and the spacious
 * density - the same one-click choices a user has in the editor's theme panel.
 * The template path's default kit per industry is chosen to be safe; for a
 * showcase the point is range, so these lean on the editorial and dark kits.
 */
const BRIEFS = [
  { brief: 'a modern website for a photography studio shooting weddings and portraits', industry: 'Photography', kit: 'midnight-neon' },
  { brief: 'a neighbourhood sushi restaurant with a seasonal omakase menu', industry: 'Restaurant', kit: 'warm-clay' },
  { brief: 'a boutique hair salon that specialises in colour and restorative treatments', industry: 'Salon', kit: 'editorial-noir' },
  { brief: 'a personal training studio offering small-group coaching and nutrition plans', industry: 'Fitness', kit: 'court-lime' },
  { brief: 'a law firm offering fixed-fee advice to small businesses', industry: 'Professional services', kit: 'ember-press' },
  { brief: 'a dental practice offering gentle care for families', industry: 'Healthcare', kit: 'clinic-blue' },
];

/** Built once: generation from the template path is deterministic. */
const SITES = BRIEFS.map(({ brief, industry, kit }) => {
  const site = generateFromTemplate(brief);
  const preset = THEME_PRESETS.find((p) => p.id === kit);
  // A preset replaces the theme wholesale, exactly as the template applies one.
  const theme = preset ? themeSchema.parse({ ...preset.patch, density: 'spacious' }) : site.document.theme;
  return {
    brief,
    industry,
    kitName: preset?.name ?? null,
    brand: site.brand,
    document: { ...site.document, theme },
  };
});

/**
 * Wide enough that the pages read as pages: at this width the render is scaled
 * to about a third, where headings and imagery are legible and body copy is
 * texture. The height frames just the hero at the spacious density, so each
 * card opens on a complete composition rather than a half-cut second section.
 */
const CARD_WIDTH = 460;
const CARD_HEIGHT = 272;

function Card({ site }: { site: (typeof SITES)[number] }) {
  return (
    /*
      On phones the whole card is zoomed down: `zoom` scales layout as well as
      paint, so the reel's width and spacing shrink with it and the live render
      keeps the scale it was built for.
    */
    <figure className="group w-[460px] shrink-0 max-sm:[zoom:0.68]">
      <div className="relative rounded-[20px] bg-gradient-to-b from-white/20 via-white/[0.06] to-white/[0.03] p-px shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
        <div className="overflow-hidden rounded-[19px] bg-[#0d0d12]">
          {/* Browser chrome: traffic lights and a centred address bar. */}
          <div className="flex items-center gap-3 px-3.5 py-2.5">
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2 w-2 rounded-full bg-[#ff5f57]/80" />
              <span className="h-2 w-2 rounded-full bg-[#febc2e]/80" />
              <span className="h-2 w-2 rounded-full bg-[#28c840]/80" />
            </span>
            <span className="mx-auto flex max-w-[240px] flex-1 items-center justify-center gap-1.5 rounded-md bg-white/[0.06] px-3 py-1 font-mono text-[10.5px] text-white/50">
              <Lock className="h-2.5 w-2.5" aria-hidden />
              <span className="truncate">{hostFor(site.brand)}</span>
            </span>
            <span className="w-[38px]" aria-hidden />
          </div>
          <div className="relative">
            <SiteRender document={site.document} width={CARD_WIDTH} height={CARD_HEIGHT} scrollOnHover />
            {/* A soft fade at the fold, and a hint that the page scrolls. */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-0"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute bottom-2.5 right-2.5 inline-flex [@media(hover:none)]:hidden items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur transition-opacity duration-500 group-hover:opacity-0"
              aria-hidden
            >
              <MousePointer2 className="h-2.5 w-2.5" /> Hover to scroll
            </span>
          </div>
        </div>
      </div>
      <figcaption className="mt-5 flex items-start gap-4 px-1">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium tracking-[-0.01em] text-white">{site.brand}</p>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/45">&ldquo;{site.brief}&rdquo;</p>
          {site.kitName ? <p className="mt-2 text-[11px] text-white/30">Brand kit · {site.kitName}</p> : null}
        </div>
        <span className="mt-0.5 shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-white/55">
          {site.industry}
        </span>
      </figcaption>
    </figure>
  );
}

export function Showcase() {
  return (
    <Band id="examples" className="overflow-hidden">
      <Container>
        <Heading
          kicker="Real output"
          title="Six sentences. Six finished websites."
          lede="Each site was generated from the brief beneath it, styled with one of the built-in brand kits, and is rendered live by the same engine that builds yours. Hover any site to scroll through it."
        />
      </Container>

      {/*
        The reel is the list twice over, translated by exactly half its width,
        so the loop has no seam. The second copy is hidden from assistive tech:
        it is the same six sites again. Motion stops on hover and entirely under
        prefers-reduced-motion, where the row becomes a plain scroller.
      */}
      <div className="marquee-mask reveal mt-16 py-3">
        <div className="marquee flex w-max gap-8 px-4">
          <ul className="flex gap-8">
            {SITES.map((site) => (
              <li key={site.brief}>
                <Card site={site} />
              </li>
            ))}
          </ul>
          <ul className="flex gap-8" aria-hidden>
            {SITES.map((site) => (
              <li key={site.brief}>
                <Card site={site} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Band>
  );
}
