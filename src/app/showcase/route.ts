import { generateFromTemplate } from '@/lib/ai/template';
import { homePage } from '@/lib/website/document';
import { renderPageHtml } from '@/lib/deploy/codegen';
import { WEBSITE_CSS } from '@/lib/deploy/website-css';

export const runtime = 'nodejs';

/**
 * The example site, as a real document at a real URL.
 *
 * The marketing page shows this at three device widths, and each frame has to
 * be a genuine iframe: CSS media queries resolve against the layout viewport,
 * so a scaled `div` at 390px would still match `lg:` and render the desktop
 * layout at phone size - a picture of the claim rather than evidence for it.
 *
 * Serving it here rather than inlining it into each frame is not a detail. The
 * document is around a megabyte with its stylesheet, and three copies escaped
 * into `srcDoc` attributes took the home page from 220kB compressed to 990kB.
 * At a URL the browser fetches it once, caches it, and reuses it for all three.
 *
 * Deterministic and public: the same generated document every time, containing
 * nothing that is not already on the marketing page.
 */

/**
 * Chosen for how it reads at a glance, on a black section.
 *
 * This was a photography studio: white ground, one photograph, a lot of air.
 * Elegant at full size and almost invisible scaled to a third of it - three
 * pale rectangles on a dark band, which is not what a section arguing the
 * generator produces finished work should show. This one carries its own warm
 * ground and an accent colour, so it reads as a designed page rather than as a
 * blank one even at 384px wide.
 *
 * Still a brief the offline template path answers with tailored copy rather
 * than filler, which is the constraint every showcase brief is under - this
 * renders at build time, with no model.
 */
const SITE = generateFromTemplate('a neighbourhood sushi restaurant with a seasonal omakase menu');

export async function GET() {
  const page = homePage(SITE.document);

  const deployed = await renderPageHtml(SITE.document, page, {
    name: SITE.brand,
    description: SITE.description,
    baseUrl: null,
  });

  /**
   * A deployed page links `/_site.css`, which ships beside it. Nothing serves
   * that path here, so the stylesheet is inlined instead - the same
   * `WEBSITE_CSS` written to that file, so the rendering is identical and only
   * the delivery differs.
   */
  const html = deployed.replace('<link rel="stylesheet" href="/_site.css">', `<style>${WEBSITE_CSS}</style>`);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Deterministic, so it can be cached hard. The three frames on the home
      // page then cost one request between them.
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, immutable',
      // It is an example, not a page anyone should find in search results.
      'X-Robots-Tag': 'noindex',
    },
  });
}
