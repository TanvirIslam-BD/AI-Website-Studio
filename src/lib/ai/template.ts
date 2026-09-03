import { createSection } from '@/lib/website/blueprints';
import { normalizeDocument, pageSchema, type WebsiteDocument } from '@/lib/website/document';
import { stockImages, type StockTopic } from '@/lib/website/stock';
import { THEME_PRESETS, themeSchema } from '@/lib/website/theme';
import type { Section, SectionType } from '@/lib/website/sections';
import { createId } from '@/lib/ids';
import { detectTopic, guessBrand } from './topics';

/**
 * Offline template generator.
 *
 * The fallback when no LLM key is configured, and the safety net when a model
 * response fails validation. It builds a complete, on-topic website from the
 * same blueprints and section schemas the AI path uses, so the product is
 * fully usable - and demoable - without any credentials.
 */

type TopicCopy = {
  themeId: string;
  hero: { eyebrow: string; heading: (brand: string) => string; subheading: string };
  services: Array<{ icon: string; title: string; description: string }>;
  /** Body section order for the home page. */
  home?: SectionType[];
};

const GENERIC: TopicCopy = {
  themeId: 'studio-indigo',
  hero: {
    eyebrow: 'Now taking new clients',
    heading: (brand) => `${brand} does the work that moves your business`,
    subheading: 'Clear scope, senior people, and a launch date you can plan around.',
  },
  services: [
    { icon: 'sparkles', title: 'Strategy', description: 'We start from the outcome you need and work back to a plan you can ship.' },
    { icon: 'palette', title: 'Design', description: 'Distinctive, accessible design that still looks right a year from now.' },
    { icon: 'rocket', title: 'Delivery', description: 'Hands-on build and launch support, with clear reporting throughout.' },
  ],
};

const TOPIC_COPY: Partial<Record<StockTopic, TopicCopy>> = {
  photography: {
    themeId: 'editorial-noir',
    hero: {
      eyebrow: 'Portrait & editorial photography',
      heading: (brand) => `${brand} photographs the moments that matter`,
      subheading: 'Natural, unhurried sessions in studio or on location, delivered in two weeks.',
    },
    services: [
      { icon: 'camera', title: 'Portrait sessions', description: 'Individuals, couples and families, shot in natural light.' },
      { icon: 'heart', title: 'Weddings', description: 'Full-day documentary coverage with a calm presence and no stiff poses.' },
      { icon: 'briefcase', title: 'Commercial', description: 'Product, brand and team photography built for your website.' },
    ],
    home: ['gallery', 'features', 'textMedia', 'testimonials', 'faq'],
  },
  restaurant: {
    themeId: 'warm-clay',
    hero: {
      eyebrow: 'Open Tuesday to Sunday',
      heading: (brand) => `${brand} - seasonal cooking, done properly`,
      subheading: 'A short menu that changes with the market, and a wine list worth staying for.',
    },
    services: [
      { icon: 'coffee', title: 'Dinner service', description: 'Small plates and mains from 5pm, walk-ins welcome at the bar.' },
      { icon: 'users', title: 'Private events', description: 'Sit-down dining for up to 40 in our back room.' },
      { icon: 'truck', title: 'Catering', description: 'Set menus for offices and celebrations, delivered ready to serve.' },
    ],
    home: ['features', 'gallery', 'textMedia', 'testimonials', 'contact'],
  },
  fitness: {
    themeId: 'midnight-neon',
    hero: {
      eyebrow: 'First session free',
      heading: (brand) => `Train with ${brand} and actually stick with it`,
      subheading: 'Small-group coaching built around your schedule, your body and your goals.',
    },
    services: [
      { icon: 'zap', title: 'Small-group training', description: 'Six people per session, so your form is always watched.' },
      { icon: 'users', title: '1-to-1 coaching', description: 'A programme written for you, adjusted every fortnight.' },
      { icon: 'trending-up', title: 'Online plans', description: 'Weekly check-ins and a plan you can run from any gym.' },
    ],
    home: ['features', 'stats', 'testimonials', 'pricing', 'faq'],
  },
  salon: {
    themeId: 'soft-pastel',
    hero: {
      eyebrow: 'Booking two weeks ahead',
      heading: (brand) => `${brand} - a cut that grows out well`,
      subheading: 'Considered colour and cutting from stylists who listen before they pick up the scissors.',
    },
    services: [
      { icon: 'scissors', title: 'Cut & finish', description: 'A consultation, a proper cut, and styling advice you can repeat at home.' },
      { icon: 'palette', title: 'Colour', description: 'Balayage, highlights and grey coverage, patch test included.' },
      { icon: 'heart', title: 'Treatments', description: 'Repair and gloss treatments that keep colour looking new.' },
    ],
    home: ['features', 'gallery', 'pricing', 'testimonials', 'contact'],
  },
  tech: {
    themeId: 'studio-indigo',
    hero: {
      eyebrow: 'Built for teams that ship',
      heading: (brand) => `${brand} turns messy work into one clear workflow`,
      subheading: 'Set it up in an afternoon and give your team one place to see what is actually happening.',
    },
    services: [
      { icon: 'zap', title: 'Fast by default', description: 'Every view loads instantly, even on a hundred thousand records.' },
      { icon: 'shield', title: 'Secure by design', description: 'SSO, audit logs and role-based access on every plan.' },
      { icon: 'layers', title: 'Fits your stack', description: 'Two-way sync with the tools your team already lives in.' },
    ],
    home: ['features', 'logos', 'stats', 'pricing', 'faq'],
  },
  legal: {
    themeId: 'clinic-blue',
    hero: {
      eyebrow: 'Fixed fees, no surprises',
      heading: (brand) => `${brand} - straight answers on complicated matters`,
      subheading: 'Practical advice in plain language, with the cost agreed before we start.',
    },
    services: [
      { icon: 'briefcase', title: 'Business advisory', description: 'Contracts, structures and disputes handled end to end.' },
      { icon: 'shield', title: 'Property', description: 'Conveyancing and commercial leases, tracked to completion.' },
      { icon: 'users', title: 'Private clients', description: 'Wills, estates and family matters, handled discreetly.' },
    ],
    home: ['features', 'stats', 'textMedia', 'testimonials', 'faq'],
  },
  health: {
    themeId: 'clinic-blue',
    hero: {
      eyebrow: 'Same-week appointments',
      heading: (brand) => `${brand} - care that takes the time to listen`,
      subheading: 'Longer appointments, clear treatment plans, and clinicians who explain the why.',
    },
    services: [
      { icon: 'heart', title: 'Consultations', description: 'Thirty-minute appointments, so nothing gets rushed.' },
      { icon: 'shield', title: 'Preventive care', description: 'Screening and check-ups with results explained in person.' },
      { icon: 'clock', title: 'Urgent slots', description: 'Same-day appointments reserved for existing patients.' },
    ],
    home: ['features', 'textMedia', 'team', 'testimonials', 'faq'],
  },
};

const DEFAULT_HOME: SectionType[] = ['features', 'gallery', 'textMedia', 'testimonials', 'faq'];

const BRAND_BY_TOPIC: Partial<Record<StockTopic, string>> = {
  photography: 'Aperture & Light',
  restaurant: 'Fern & Ash',
  fitness: 'Ironwood Athletic',
  salon: 'Halo Studio',
  tech: 'Northwind',
  legal: 'Merrow & Slade',
  health: 'Beacon Clinic',
  realestate: 'Ridgeline Property',
  construction: 'Stonebridge Build',
  travel: 'Farside Travel',
  education: 'Willowmere Academy',
  coffee: 'Meridian Roasters',
  pets: 'Happy Paws',
  wedding: 'Ever & Ivy',
  interior: 'Loam Interiors',
  automotive: 'Redline Motors',
  agency: 'Fieldnote Studio',
};

export type TemplateSite = {
  document: WebsiteDocument;
  brand: string;
  topic: StockTopic;
  description: string;
};

/** Deterministic: the same brief always produces the same website. */
export function generateFromTemplate(brief: string): TemplateSite {
  const topic = detectTopic(brief);
  const copy = TOPIC_COPY[topic] ?? GENERIC;
  const brand = guessBrand(brief) || BRAND_BY_TOPIC[topic] || 'Northwind';
  const images = stockImages(topic, 6);
  const context = { brand, topic };

  const preset = THEME_PRESETS.find((p) => p.id === copy.themeId) ?? THEME_PRESETS[0];
  const theme = themeSchema.parse(preset.patch);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
  ];

  const header = createSection('header', { logoText: brand, links: navLinks, cta: { label: 'Get in touch', href: '/contact' } }, context);
  const footer = createSection(
    'footer',
    {
      logoText: brand,
      columns: [
        { title: 'Company', links: navLinks.slice(1) },
        { title: 'Explore', links: [{ label: 'Our work', href: '/#work' }, { label: 'FAQ', href: '/#faq' }] },
      ],
      legal: `© ${new Date().getFullYear()} ${brand}. All rights reserved.`,
    },
    context,
  );

  const chrome = (sections: Section[]): Section[] => [
    { ...header, id: createId('sec') } as Section,
    ...sections,
    { ...footer, id: createId('sec') } as Section,
  ];

  const hero = createSection(
    'hero',
    {
      eyebrow: copy.hero.eyebrow,
      heading: copy.hero.heading(brand),
      subheading: copy.hero.subheading,
      image: { url: images[0], alt: `${brand}` },
      primaryCta: { label: 'Get started', href: '/contact' },
      secondaryCta: { label: 'See our work', href: '#work' },
    },
    context,
  );

  const bodyFor = (type: SectionType): Section => {
    if (type === 'features') {
      return createSection(
        'features',
        { eyebrow: 'Services', heading: 'What we do best', subheading: 'The work clients come to us for.', items: copy.services },
        context,
      );
    }
    if (type === 'gallery') {
      return createSection('gallery', { images: images.map((url, i) => ({ url, alt: `${brand} work ${i + 1}` })) }, context);
    }
    return createSection(type, {}, context);
  };

  const homeBody = (copy.home ?? DEFAULT_HOME).map(bodyFor);
  const cta = createSection('cta', { heading: `Work with ${brand}`, primaryCta: { label: 'Start a conversation', href: '/contact' } }, context);

  const pages = [
    pageSchema.parse({
      id: createId('pg'),
      name: 'Home',
      slug: '',
      isHome: true,
      seoTitle: `${brand}`,
      seoDesc: copy.hero.subheading,
      sections: chrome([hero, ...homeBody, cta]),
    }),
    pageSchema.parse({
      id: createId('pg'),
      name: 'About',
      slug: 'about',
      isHome: false,
      seoTitle: `About ${brand}`,
      seoDesc: `The people and the thinking behind ${brand}.`,
      sections: chrome([
        createSection('hero', { variant: 'minimal', eyebrow: 'About us', heading: `The story behind ${brand}`, subheading: copy.hero.subheading, primaryCta: undefined, secondaryCta: undefined }, context),
        createSection('textMedia', { image: { url: images[1], alt: `Inside ${brand}` } }, context),
        createSection('stats', {}, context),
        createSection('team', {}, context),
        cta,
      ]),
    }),
    pageSchema.parse({
      id: createId('pg'),
      name: 'Services',
      slug: 'services',
      isHome: false,
      seoTitle: `Services | ${brand}`,
      seoDesc: 'What we do and what it costs.',
      sections: chrome([
        createSection('hero', { variant: 'minimal', eyebrow: 'Services', heading: 'How we can help', subheading: 'Pick the engagement that fits where you are.', primaryCta: undefined, secondaryCta: undefined }, context),
        createSection('features', { variant: 'list', heading: 'Our services', items: copy.services }, context),
        createSection('pricing', {}, context),
        createSection('faq', {}, context),
        cta,
      ]),
    }),
    pageSchema.parse({
      id: createId('pg'),
      name: 'Contact',
      slug: 'contact',
      isHome: false,
      seoTitle: `Contact ${brand}`,
      seoDesc: `Get in touch with ${brand}.`,
      sections: chrome([
        createSection('contact', {}, context),
        createSection('faq', { variant: 'twoColumn', heading: 'Before you write' }, context),
      ]),
    }),
  ];

  const assets = images.map((url) => ({ id: createId('ast'), url, alt: '', provider: 'stock' as const, meta: null }));

  return {
    document: normalizeDocument({ theme, pages, assets }),
    brand,
    topic,
    description: copy.hero.subheading,
  };
}
