import { ArrowUpRight } from 'lucide-react';
import { generateFromTemplate } from '@/lib/ai/template';
import { homePage } from '@/lib/website/document';
import { resolveTheme } from '@/lib/website/theme';
import { FONTS } from '@/lib/website/theme';
import { Container, Section, SectionHeading } from './shell';

/**
 * Example sites, generated at module scope from real briefs.
 *
 * Every card - brand name, palette, typeface, imagery and headline - is pulled
 * out of an actual generated document, so this gallery is a genuine sample of
 * output rather than art direction that the product cannot deliver.
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
  const headline = hero && 'heading' in hero ? hero.heading : site.brand;
  const image = (hero && 'image' in hero ? hero.image?.url : undefined) ?? site.document.assets[0]?.url;

  return {
    industry,
    brand: site.brand,
    headline,
    description: site.description,
    image,
    theme: site.document.theme,
    pages: site.document.pages.length,
    sections: site.document.pages.reduce((sum, p) => sum + p.sections.length, 0),
  };
});

export function Examples() {
  return (
    <Section id="examples" tone="muted">
      <Container>
        <SectionHeading
          eyebrow="Examples"
          title="One sentence in, a whole site out"
          body="Each of these came from a single line of description - brand name, palette, typeface, copy and photography chosen to fit the trade."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLES.map((example) => {
            const t = resolveTheme(example.theme);
            const serif = FONTS.find((f) => f.name === example.theme.headingFont)?.category === 'serif';

            return (
              <article
                key={example.brand}
                className="group overflow-hidden rounded-2xl border border-ink-200 bg-white transition-shadow hover:shadow-panel"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={example.image}
                    alt={`${example.brand} website`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, rgba(10,12,16,0.05) 30%, rgba(10,12,16,0.82))' }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                      {example.industry}
                    </p>
                    <p
                      className="mt-1.5 text-xl font-bold leading-tight tracking-[-0.02em] text-white"
                      style={{ fontFamily: `'${example.theme.headingFont}', ${serif ? 'serif' : 'sans-serif'}` }}
                    >
                      {example.brand}
                    </p>
                  </div>
                  <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>

                <div className="p-5">
                  <p className="line-clamp-2 min-h-[40px] text-[13px] font-medium leading-relaxed text-ink-800">
                    {example.headline}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex gap-1">
                      {[t.primary, t.secondary, t.surface, t.text].map((colour, i) => (
                        <span
                          key={i}
                          className="h-4 w-4 rounded-full ring-1 ring-inset ring-black/10"
                          style={{ background: colour }}
                        />
                      ))}
                    </span>
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-wide text-ink-400">
                      {example.pages} pages · {example.sections} sections
                    </span>
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
