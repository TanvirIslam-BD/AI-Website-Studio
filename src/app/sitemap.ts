import type { MetadataRoute } from 'next';
import { absoluteUrl, INDEXABLE_PAGES } from '@/lib/seo';

export const dynamic = 'force-static';

/**
 * sitemap.xml.
 *
 * Built from the explicit list in lib/seo.ts rather than from the route tree,
 * so adding a page to the app does not silently add it to the index.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return INDEXABLE_PAGES.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}
