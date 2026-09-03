import { z } from 'zod';

/**
 * The section library.
 *
 * Every website is a list of typed sections. `type` selects a React component
 * from the renderer registry; the schema below is the contract for its data.
 * All AI output is parsed through these schemas, which is what makes generated
 * sites deterministic, editable and safe (no HTML, no code, no free-form keys).
 */

// --- shared primitives -----------------------------------------------------

export const linkSchema = z.object({
  label: z.string().min(1).max(80),
  href: z.string().max(300).default('#'),
});

export const imageSchema = z.object({
  url: z.string().max(2000),
  alt: z.string().max(300).default(''),
  assetId: z.string().optional(),
});

export const BACKGROUNDS = ['default', 'surface', 'primary', 'inverse'] as const;
export const ALIGNMENTS = ['left', 'center'] as const;

/** Props every section shares, so the inspector can offer them generically. */
export const baseProps = {
  background: z.enum(BACKGROUNDS).default('default'),
  paddingY: z.enum(['none', 'sm', 'md', 'lg']).default('md'),
};

export const ICON_NAMES = [
  'sparkles', 'camera', 'heart', 'star', 'shield', 'zap', 'clock', 'users',
  'award', 'palette', 'globe', 'phone', 'mail', 'map-pin', 'check', 'trending-up',
  'briefcase', 'rocket', 'layers', 'wrench', 'leaf', 'coffee', 'scissors', 'truck',
] as const;

const iconSchema = z.enum(ICON_NAMES).catch('sparkles');

// --- section schemas -------------------------------------------------------

export const headerSchema = z.object({
  type: z.literal('header'),
  variant: z.enum(['simple', 'centered', 'split']).default('simple'),
  logoText: z.string().min(1).max(40).default('Brand'),
  logoImage: imageSchema.optional(),
  links: z.array(linkSchema).max(8).default([]),
  cta: linkSchema.optional(),
  sticky: z.boolean().default(true),
  ...baseProps,
});

export const heroSchema = z.object({
  type: z.literal('hero'),
  variant: z.enum(['split', 'centered', 'imageBackground', 'minimal']).default('split'),
  eyebrow: z.string().max(80).optional(),
  heading: z.string().min(1).max(160).default('A headline that sells'),
  subheading: z.string().max(400).optional(),
  primaryCta: linkSchema.optional(),
  secondaryCta: linkSchema.optional(),
  image: imageSchema.optional(),
  align: z.enum(ALIGNMENTS).default('left'),
  ...baseProps,
});

export const featuresSchema = z.object({
  type: z.literal('features'),
  variant: z.enum(['cards', 'plain', 'list', 'alternating']).default('cards'),
  eyebrow: z.string().max(80).optional(),
  heading: z.string().max(160).default('What we do'),
  subheading: z.string().max(400).optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  items: z
    .array(
      z.object({
        icon: iconSchema.default('sparkles'),
        title: z.string().min(1).max(90),
        description: z.string().max(320).default(''),
        image: imageSchema.optional(),
      }),
    )
    .max(12)
    .default([]),
  align: z.enum(ALIGNMENTS).default('center'),
  ...baseProps,
});

export const gallerySchema = z.object({
  type: z.literal('gallery'),
  variant: z.enum(['grid', 'masonry', 'filmstrip']).default('grid'),
  eyebrow: z.string().max(80).optional(),
  heading: z.string().max(160).default('Selected work'),
  subheading: z.string().max(400).optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  images: z
    .array(imageSchema.extend({ caption: z.string().max(160).optional() }))
    .max(24)
    .default([]),
  ...baseProps,
});

export const testimonialsSchema = z.object({
  type: z.literal('testimonials'),
  variant: z.enum(['cards', 'single', 'compact']).default('cards'),
  eyebrow: z.string().max(80).optional(),
  heading: z.string().max(160).default('Loved by clients'),
  subheading: z.string().max(400).optional(),
  items: z
    .array(
      z.object({
        quote: z.string().min(1).max(600),
        name: z.string().max(80).default(''),
        role: z.string().max(120).default(''),
        avatar: imageSchema.optional(),
        rating: z.number().int().min(1).max(5).optional(),
      }),
    )
    .max(12)
    .default([]),
  ...baseProps,
});

export const ctaSchema = z.object({
  type: z.literal('cta'),
  variant: z.enum(['banner', 'boxed', 'split']).default('boxed'),
  eyebrow: z.string().max(80).optional(),
  heading: z.string().max(160).default('Ready to get started?'),
  subheading: z.string().max(400).optional(),
  primaryCta: linkSchema.optional(),
  secondaryCta: linkSchema.optional(),
  image: imageSchema.optional(),
  ...baseProps,
  background: z.enum(BACKGROUNDS).default('primary'),
});

export const textMediaSchema = z.object({
  type: z.literal('textMedia'),
  variant: z.enum(['imageRight', 'imageLeft', 'stacked']).default('imageRight'),
  eyebrow: z.string().max(80).optional(),
  heading: z.string().max(160).default('About us'),
  body: z.string().max(2000).default(''),
  bullets: z.array(z.string().max(200)).max(8).default([]),
  image: imageSchema.optional(),
  cta: linkSchema.optional(),
  ...baseProps,
});

export const faqSchema = z.object({
  type: z.literal('faq'),
  variant: z.enum(['accordion', 'twoColumn']).default('accordion'),
  eyebrow: z.string().max(80).optional(),
  heading: z.string().max(160).default('Frequently asked questions'),
  subheading: z.string().max(400).optional(),
  items: z
    .array(z.object({ question: z.string().min(1).max(200), answer: z.string().max(1200).default('') }))
    .max(16)
    .default([]),
  ...baseProps,
});

export const contactSchema = z.object({
  type: z.literal('contact'),
  variant: z.enum(['split', 'centered']).default('split'),
  eyebrow: z.string().max(80).optional(),
  heading: z.string().max(160).default('Get in touch'),
  subheading: z.string().max(400).optional(),
  email: z.string().max(160).default(''),
  phone: z.string().max(60).default(''),
  address: z.string().max(240).default(''),
  hours: z.string().max(240).default(''),
  showForm: z.boolean().default(true),
  submitLabel: z.string().max(60).default('Send message'),
  ...baseProps,
});

export const pricingSchema = z.object({
  type: z.literal('pricing'),
  variant: z.enum(['cards', 'table']).default('cards'),
  eyebrow: z.string().max(80).optional(),
  heading: z.string().max(160).default('Simple pricing'),
  subheading: z.string().max(400).optional(),
  plans: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        price: z.string().max(40).default(''),
        period: z.string().max(40).default(''),
        description: z.string().max(240).default(''),
        features: z.array(z.string().max(160)).max(12).default([]),
        cta: linkSchema.optional(),
        highlighted: z.boolean().default(false),
      }),
    )
    .max(4)
    .default([]),
  ...baseProps,
});

export const statsSchema = z.object({
  type: z.literal('stats'),
  variant: z.enum(['row', 'cards']).default('row'),
  heading: z.string().max(160).optional(),
  subheading: z.string().max(400).optional(),
  items: z
    .array(z.object({ value: z.string().min(1).max(24), label: z.string().max(120).default('') }))
    .max(6)
    .default([]),
  ...baseProps,
  background: z.enum(BACKGROUNDS).default('surface'),
});

export const logosSchema = z.object({
  type: z.literal('logos'),
  heading: z.string().max(160).optional(),
  items: z.array(z.object({ name: z.string().min(1).max(60), image: imageSchema.optional() })).max(10).default([]),
  ...baseProps,
  paddingY: z.enum(['none', 'sm', 'md', 'lg']).default('sm'),
});

export const teamSchema = z.object({
  type: z.literal('team'),
  eyebrow: z.string().max(80).optional(),
  heading: z.string().max(160).default('Meet the team'),
  subheading: z.string().max(400).optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(80),
        role: z.string().max(120).default(''),
        bio: z.string().max(400).default(''),
        image: imageSchema.optional(),
      }),
    )
    .max(12)
    .default([]),
  ...baseProps,
});

export const footerSchema = z.object({
  type: z.literal('footer'),
  variant: z.enum(['columns', 'simple', 'centered']).default('columns'),
  logoText: z.string().max(40).default('Brand'),
  tagline: z.string().max(240).default(''),
  columns: z
    .array(z.object({ title: z.string().max(60), links: z.array(linkSchema).max(8).default([]) }))
    .max(4)
    .default([]),
  socials: z
    .array(
      z.object({
        platform: z.enum(['instagram', 'facebook', 'x', 'linkedin', 'youtube', 'tiktok', 'github', 'dribbble']),
        href: z.string().max(300).default('#'),
      }),
    )
    .max(8)
    .default([]),
  legal: z.string().max(200).default(''),
  ...baseProps,
  background: z.enum(BACKGROUNDS).default('surface'),
});

// --- registry --------------------------------------------------------------

const SCHEMA_BY_TYPE = {
  header: headerSchema,
  hero: heroSchema,
  features: featuresSchema,
  gallery: gallerySchema,
  testimonials: testimonialsSchema,
  textMedia: textMediaSchema,
  stats: statsSchema,
  logos: logosSchema,
  pricing: pricingSchema,
  team: teamSchema,
  faq: faqSchema,
  contact: contactSchema,
  cta: ctaSchema,
  footer: footerSchema,
} as const;

export const SECTION_TYPES = Object.keys(SCHEMA_BY_TYPE) as SectionType[];
export type SectionType = keyof typeof SCHEMA_BY_TYPE;

const identity = z.object({
  id: z.string().min(1),
  hidden: z.boolean().default(false),
});

/** Each section schema, widened with the identity fields the document needs. */
export const sectionSchemas = {
  header: headerSchema.merge(identity),
  hero: heroSchema.merge(identity),
  features: featuresSchema.merge(identity),
  gallery: gallerySchema.merge(identity),
  testimonials: testimonialsSchema.merge(identity),
  textMedia: textMediaSchema.merge(identity),
  stats: statsSchema.merge(identity),
  logos: logosSchema.merge(identity),
  pricing: pricingSchema.merge(identity),
  team: teamSchema.merge(identity),
  faq: faqSchema.merge(identity),
  contact: contactSchema.merge(identity),
  cta: ctaSchema.merge(identity),
  footer: footerSchema.merge(identity),
} as const;

export const sectionSchema = z.discriminatedUnion('type', [
  sectionSchemas.header,
  sectionSchemas.hero,
  sectionSchemas.features,
  sectionSchemas.gallery,
  sectionSchemas.testimonials,
  sectionSchemas.textMedia,
  sectionSchemas.stats,
  sectionSchemas.logos,
  sectionSchemas.pricing,
  sectionSchemas.team,
  sectionSchemas.faq,
  sectionSchemas.contact,
  sectionSchemas.cta,
  sectionSchemas.footer,
]);

export type Section = z.infer<typeof sectionSchema>;
export type SectionOfType<T extends SectionType> = Extract<Section, { type: T }>;

/** Props-only schema (no id/hidden) - used to validate AI patches. */
export function sectionPropsSchema(type: SectionType) {
  return SCHEMA_BY_TYPE[type];
}

export const SECTION_META: Record<
  SectionType,
  { label: string; description: string; icon: string; group: 'structure' | 'content' | 'social' | 'convert'; singleton?: boolean }
> = {
  header: { label: 'Header', description: 'Logo, navigation and a call to action', icon: 'panel-top', group: 'structure', singleton: true },
  hero: { label: 'Hero', description: 'Above-the-fold headline and primary action', icon: 'layout-template', group: 'content' },
  features: { label: 'Features', description: 'Services or benefits in a grid', icon: 'grid-2x2', group: 'content' },
  gallery: { label: 'Gallery', description: 'Image grid for portfolios and work', icon: 'images', group: 'content' },
  testimonials: { label: 'Testimonials', description: 'Social proof from customers', icon: 'quote', group: 'social' },
  textMedia: { label: 'Text + Media', description: 'Long-form copy beside an image', icon: 'text-quote', group: 'content' },
  stats: { label: 'Stats', description: 'Numbers that build credibility', icon: 'bar-chart-3', group: 'social' },
  logos: { label: 'Logo cloud', description: 'Clients or press mentions', icon: 'building-2', group: 'social' },
  pricing: { label: 'Pricing', description: 'Plans and packages', icon: 'credit-card', group: 'convert' },
  team: { label: 'Team', description: 'People behind the business', icon: 'users', group: 'content' },
  faq: { label: 'FAQ', description: 'Answers to common objections', icon: 'help-circle', group: 'content' },
  contact: { label: 'Contact', description: 'Details and an enquiry form', icon: 'mail', group: 'convert' },
  cta: { label: 'Call to action', description: 'Focused conversion band', icon: 'megaphone', group: 'convert' },
  footer: { label: 'Footer', description: 'Site-wide links and legal', icon: 'panel-bottom', group: 'structure', singleton: true },
};

// --- sanitisation ----------------------------------------------------------

const SAFE_URL = /^(https?:\/\/|\/|#|mailto:|tel:)/i;

/** Blocks javascript:, data: and other executable URL schemes. */
export function safeHref(value: unknown, fallback = '#'): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (!SAFE_URL.test(trimmed)) return fallback;
  return trimmed;
}

export function safeImageUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) return trimmed;
  return '';
}

/**
 * Deep sanitisation of AI/user supplied content. Runs after zod validation and
 * scrubs anything that could turn data into behaviour: URL schemes, angle
 * brackets in text (rendering is JSX-escaped anyway, but the export path also
 * needs to be safe) and unexpected key shapes.
 */
function sanitizeValue(key: string, value: unknown): unknown {
  if (typeof value === 'string') {
    if (key === 'href') return safeHref(value);
    if (key === 'url' || key === 'avatar') return safeImageUrl(value);
    return value.replace(/[<>]/g, '');
  }
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(key, item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeValue(k, v)]));
  }
  return value;
}

export function sanitizeSection<T extends Section>(section: T): T {
  return sanitizeValue('', section) as T;
}

export function isSectionType(value: unknown): value is SectionType {
  return typeof value === 'string' && (SECTION_TYPES as string[]).includes(value);
}

/**
 * Validates one section. Returns `null` instead of throwing so a single bad
 * section from the model can be dropped without losing the whole generation.
 */
export function parseSection(input: unknown): Section | null {
  const result = sectionSchema.safeParse(input);
  if (!result.success) return null;
  return sanitizeSection(result.data);
}

/** Validates a props patch for an existing section and merges it. */
export function applySectionPatch(section: Section, patch: Record<string, unknown>): Section {
  const merged = { ...section, ...patch, id: section.id, type: section.type };
  const result = sectionSchema.safeParse(merged);
  if (!result.success) {
    throw new Error(
      `Invalid props for "${section.type}": ${result.error.issues
        .map((i) => `${i.path.join('.')} ${i.message}`)
        .join('; ')}`,
    );
  }
  return sanitizeSection(result.data);
}
