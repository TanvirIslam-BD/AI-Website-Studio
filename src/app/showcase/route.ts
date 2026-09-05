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
 * Chosen for how it reads at a glance, scaled to a third of its size.
 *
 * This was a photography studio - white ground, one photograph, a lot of air -
 * which is elegant at full size and close to invisible in a 384px frame. The
 * section argues that the generator produces finished work, so the example has
 * to survive being shrunk: a decided ground, a hard accent, and a photograph
 * behind the headline rather than beside it.
 *
 * Of the briefs the offline template path answers with tailored copy - the
 * constraint every showcase brief is under, since this renders at build time
 * with no model - this is the one that commits hardest.
 *
 * Changing it means changing SITE_SURFACE in every-screen.tsx to match, or the
 * frames flash the previous site's ground before they load.
 */
const SITE = generateFromTemplate('a personal training studio offering small-group coaching and nutrition plans');

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
