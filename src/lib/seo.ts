/**
 * Canonical origin and shared SEO helpers.
 *
 * Every absolute URL the site emits - canonicals, sitemap entries, Open Graph,
 * structured data - resolves through here, so they cannot disagree with each
 * other. Getting that wrong is the expensive kind of SEO bug: a canonical
 * pointing at a host the sitemap does not list splits a page's signals between
 * two addresses and neither ranks.
 */

const PRODUCTION_ORIGIN = 'https://web.copilotai.live';

/**
 * The configured origin, or production when it is missing or not an http(s)
 * URL. A malformed value - one Vercel project had the variable's own name as
 * its value - otherwise throws inside `new URL()` while Next collects page
 * data, and fails the whole build rather than one canonical.
 */
function resolveOrigin(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return PRODUCTION_ORIGIN;
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') return value.replace(/\/+$/, '');
  } catch {
    // Fall through to production.
  }
  console.warn(`NEXT_PUBLIC_APP_URL is not a valid http(s) URL; using ${PRODUCTION_ORIGIN}.`);
  return PRODUCTION_ORIGIN;
}

/** The production origin, without a trailing slash. */
export const SITE_ORIGIN = resolveOrigin(process.env.NEXT_PUBLIC_APP_URL);

/**
 * Whether this deployment should be indexed at all.
 *
 * Vercel gives every branch and every pull request its own public URL. Those
 * are complete copies of the site, and an indexed copy competes with
 * production for its own queries and splits the signals between them. Only the
 * production deployment says yes; a local build has no VERCEL_ENV and is not
 * reachable by a crawler either way.
 */
export const IS_INDEXABLE_DEPLOYMENT =
  !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production';

/** An absolute URL for a site-relative path. */
export function absoluteUrl(path = '/'): string {
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Pages that should be crawled and appear in the sitemap.
 *
 * Listed explicitly rather than discovered from the filesystem: the app also
 * serves the dashboard, the editor, per-project previews and the owner console,
 * none of which belong in an index, and an automatic crawl of the route tree
 * would sweep them all in. `changeFrequency` is a hint search engines largely
 * ignore; the ordering by `priority` is the part worth maintaining.
 *
 * `/pricing` is not here on purpose. It is the signed-in plans screen, and it
 * redirects an anonymous visitor to `/signin` - which robots.txt disallows - so
 * listing it would ask a crawler to follow a redirect into a blocked path and
 * report a soft error for the trouble. The public pricing is the `/#pricing`
 * section of the home page, which is already covered by `/`.
 */
export const INDEXABLE_PAGES: Array<{ path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }> = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/ai-website-generator', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/docs', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/support', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/eula', priority: 0.3, changeFrequency: 'yearly' },
];

/**
 * Paths kept out of the index.
 *
 * Signed-in surfaces and machine endpoints. `/showcase` is the example document
 * the home page frames three times - a real page, but one nobody should find in
 * a search result, and one that would read as duplicate content against the
 * examples it illustrates.
 */
export const DISALLOWED_PATHS = ['/api/', '/dashboard', '/editor/', '/preview/', '/admin', '/signin', '/integrations/', '/showcase'];
