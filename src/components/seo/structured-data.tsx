import { BRAND, COMPANY, SOCIAL_LINKS } from '@/lib/brand';
import { absoluteUrl, SITE_ORIGIN } from '@/lib/seo';

/**
 * Structured data.
 *
 * Emitted as JSON-LD so search engines and answer engines can resolve
 * "Web Copilot AI" to a specific software product rather than guessing from
 * prose. Every value here has to be true of the visible page - schema that
 * describes something the page does not show is the kind of markup that gets a
 * site a manual action, and it is trivially checkable by the people issuing
 * them.
 *
 * Deliberately absent: aggregateRating, review, and any Offer for the paid
 * plans. There are no reviews to report, and Pro and Agency read "Coming soon"
 * on the pricing page because checkout is not connected - advertising a price
 * in markup that nobody can actually pay would be a false claim in the one
 * place that is machine-read.
 */

type Json = Record<string, unknown>;

function JsonLd({ data }: { data: Json | Json[] }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from constants in this repository, never from user
      // input, and `JSON.stringify` escapes the quotes that would break out of
      // the tag. `<` is escaped anyway, so a future string containing "</script"
      // cannot close it early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
const SOFTWARE_ID = `${SITE_ORIGIN}/#software`;

/**
 * The publisher and the site itself.
 *
 * Both carry a stable `@id` so every other node on the site can point at them
 * instead of restating them, which is what lets a crawler treat the pages as
 * one entity rather than several similarly-named ones.
 */
export function SiteStructuredData() {
  const organization: Json = {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: BRAND.name,
    legalName: COMPANY.legalName,
    alternateName: ['Web Copilot AI', BRAND.shortName],
    url: absoluteUrl('/'),
    logo: absoluteUrl('/icon.svg'),
    description: BRAND.definition,
    email: COMPANY.supportEmail,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address[0],
      addressLocality: 'Harrisonville',
      addressRegion: 'MO',
      postalCode: '64701-2444',
      addressCountry: 'US',
    },
    /**
     * The profiles that corroborate the entity. `sameAs` is how a search engine
     * confirms that this site, these accounts and the name are one thing rather
     * than several - which is most of what "ranking for your own brand" is.
     * Taken from the same list the footer renders, so a profile cannot be
     * claimed here and missing there.
     */
    sameAs: SOCIAL_LINKS.filter((link) => link.platform !== 'email' && link.href).map((link) => link.href),
  };

  const website: Json = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: BRAND.name,
    alternateName: 'Web Copilot AI',
    url: absoluteUrl('/'),
    description: BRAND.description,
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en',
  };

  const software: Json = {
    '@type': 'SoftwareApplication',
    '@id': SOFTWARE_ID,
    name: BRAND.name,
    alternateName: 'Web Copilot AI',
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: BRAND.category,
    operatingSystem: 'Web browser',
    url: absoluteUrl('/'),
    description: BRAND.definition,
    publisher: { '@id': ORGANIZATION_ID },
    featureList: [
      'Generate a complete multi-page website from a written prompt',
      'Edit the generated website in a visual editor',
      'Direct edits conversationally with an AI copilot',
      'Apply a brand kit of colours, typefaces and spacing',
      'Publish static HTML to your own Vercel account',
      'Export the website and host it anywhere',
    ],
    /**
     * Only the plan that can actually be used today. The paid tiers are shown
     * as "Coming soon" on the pricing page, so they are not offers yet.
     */
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      category: 'Free',
      url: absoluteUrl('/pricing'),
    },
  };

  return <JsonLd data={{ '@context': 'https://schema.org', '@graph': [organization, website, software] }} />;
}

/** A page node, tied to the site entity, with its breadcrumb trail. */
export function PageStructuredData({
  path,
  name,
  description,
  breadcrumbs,
}: {
  path: string;
  name: string;
  description: string;
  /** Ordered, excluding the page itself - "Home" first. */
  breadcrumbs?: Array<{ name: string; path: string }>;
}) {
  const url = absoluteUrl(path);

  const webPage: Json = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': SOFTWARE_ID },
    inLanguage: 'en',
  };

  const graph: Json[] = [webPage];

  if (breadcrumbs?.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumbs`,
      itemListElement: [...breadcrumbs, { name, path }].map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    });
  }

  return <JsonLd data={{ '@context': 'https://schema.org', '@graph': graph }} />;
}

/**
 * FAQ markup, for a page that visibly answers these questions.
 *
 * Passed the same array the page renders, never a separate list, so the markup
 * cannot drift from what a reader sees - which is both the guideline and the
 * only version worth having.
 */
export function FaqStructuredData({ items, path }: { items: ReadonlyArray<{ q: string; a: string }>; path: string }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${absoluteUrl(path)}#faq`,
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }}
    />
  );
}
