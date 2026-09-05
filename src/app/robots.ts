import type { MetadataRoute } from 'next';
import { absoluteUrl, DISALLOWED_PATHS, IS_INDEXABLE_DEPLOYMENT } from '@/lib/seo';

export const dynamic = 'force-static';

/**
 * robots.txt.
 *
 * The site had none, which is not neutral: without one a crawler is free to
 * spend its budget on the editor, per-project previews and the API, and those
 * are the majority of the route tree.
 */
export default function robots(): MetadataRoute.Robots {
  // A preview deployment refuses everything: it is a complete copy of the site
  // on its own public URL, and an indexed copy competes with production.
  if (!IS_INDEXABLE_DEPLOYMENT) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: DISALLOWED_PATHS }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
