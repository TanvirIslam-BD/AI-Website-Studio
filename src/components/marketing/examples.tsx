import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { generateFromTemplate } from '@/lib/ai/template';
import { homePage } from '@/lib/website/document';
import { FONTS } from '@/lib/website/theme';
import { Container, Section, SectionHeading } from './shell';

/**
 * Example sites, generated at module scope from real briefs.
 *
 * Brand name, headline, palette, typeface and imagery all come out of an
 * actual generated document, so this is a genuine sample of output rather than
 * art direction the product cannot deliver.
 *
 * "Generate similar" carries the brief through sign-up into the real generator,
 * so the card is a working entry point rather than decoration.
 */
const BRIEFS = [
  { brief: 'a modern website for a photography business', industry: 'Photography' },
  { brief: 'a neighbourhood Italian restaurant with a short seasonal menu', industry: 'Restaurant' },
  { brief: 'a boutique hair salon that specialises in colour', industry: 'Salon' },
  { brief: 'a landing page for a project management SaaS aimed at agencies', industry: 'SaaS' },
  { brief: 'a personal training studio offering small-group coaching', industry: 'Fitness' },
  { brief: 'a law firm offering fixed-fee business advice', industry: 'Professional services' },
];

const EXAMPLES = BRIEFS.map(({ brief, industry }) => {
  const site = generateFromTemplate(brief);
  const page = homePage(site.document);
  const hero = page.sections.find((section) => section.type === 'hero');

  return {
    brief,
    industry,
    brand: site.brand,
    headline: hero && 'heading' in hero ? hero.heading : site.brand,
    description: site.description,
    // The document stores 1600px originals for the deployed site; a card shows
    // them at around 380px, so narrow the request rather than shipping four
    // times the pixels needed.
    image: ((hero && 'image' in hero ? hero.image?.url : undefined) ?? site.document.assets[0]?.url)?.replace(
      'w=1600',
      'w=760',
    ),
    serif: FONTS.find((f) => f.name === site.document.theme.headingFont)?.category === 'serif',
    pages: site.document.pages.length,
    sections: site.document.pages.reduce((sum, p) => sum + p.sections.length, 0),
  };
});

export function Examples({ signedIn }: { signedIn: boolean }) {
  return (
    <Section id="examples" tone="muted">
      <Container>
        <SectionHeading
          eyebrow="Examples"
          title="One sentence. *A complete website.*"
          body="Each of these came from a single line of description. Pick one to start from the same brief."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLES.map((example, i) => {
            const target = signedIn ? '/dashboard' : '/signin?mode=register';

            return (
              <article
                key={example.brand}
                className="reveal group overflow-hidden rounded-xl border border-ink-200 bg-white transition-shadow duration-300 hover:shadow-pop"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-ink-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={example.image}
                    alt={`${example.brand} — generated ${example.industry.toLowerCase()} website`}
                    loading="lazy"
                    className="h-full w-full object-cover grayscale transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0.10) 32%, rgba(10,10,10,0.86))' }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/60">{example.industry}</p>
                    <p
                      className="mt-1.5 text-lg font-semibold leading-tight tracking-[-0.02em] text-white"
                      style={{ fontFamily: example.serif ? "'Playfair Display', Georgia, serif" : undefined }}
                    >
                      {example.brand}
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <p className="line-clamp-2 min-h-[38px] text-[13px] leading-relaxed text-ink-600">
                    {example.headline}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink-100 pt-3.5">
                    <span className="font-mono text-[10px] uppercase tracking-wide text-ink-400">
                      {example.pages} pages · {example.sections} sections
                    </span>
                    <Link
                      href={`${target}${target.includes('?') ? '&' : '?'}prompt=${encodeURIComponent(example.brief)}`}
                      className="focus-ring inline-flex items-center gap-1 rounded text-[12px] font-medium text-ink-900 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      Generate similar
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
