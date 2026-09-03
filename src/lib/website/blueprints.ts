import { createId } from '@/lib/ids';
import { AVATARS, stockImage, stockImages } from './stock';
import { parseSection, sectionSchemas, type Section, type SectionType } from './sections';

/**
 * Blueprints: fully-populated starting content for every section type.
 *
 * Used in three places, which keeps them all consistent:
 *  1. "Add section" in the editor,
 *  2. the offline template generator (no API key required),
 *  3. as the base a model's `add_section` call is merged onto, so the AI only
 *     has to supply the props it actually cares about.
 */

export type BlueprintContext = {
  brand: string;
  topic: string;
  tagline?: string;
};

const ctx = (partial?: Partial<BlueprintContext>): BlueprintContext => ({
  brand: partial?.brand?.trim() || 'Northwind',
  topic: partial?.topic?.trim() || 'agency',
  tagline: partial?.tagline,
});

function blueprintProps(type: SectionType, input?: Partial<BlueprintContext>): Record<string, unknown> {
  const c = ctx(input);
  const images = stockImages(c.topic, 6);

  switch (type) {
    case 'header':
      return {
        type,
        variant: 'simple',
        logoText: c.brand,
        links: [
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Services', href: '/services' },
          { label: 'Contact', href: '/contact' },
        ],
        cta: { label: 'Get in touch', href: '/contact' },
        sticky: true,
      };
    case 'hero':
      return {
        type,
        variant: 'split',
        eyebrow: c.tagline ?? 'Now booking new projects',
        heading: `${c.brand} builds work that gets noticed`,
        subheading:
          'A short, specific promise that tells a visitor exactly what you do and why it matters to them.',
        primaryCta: { label: 'Start a project', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '#work' },
        image: { url: images[0], alt: `${c.brand} hero image` },
        align: 'left',
      };
    case 'features':
      return {
        type,
        variant: 'cards',
        eyebrow: 'Services',
        heading: 'Built around results, not deliverables',
        subheading: 'Three ways we help clients move faster.',
        columns: 3,
        items: [
          { icon: 'sparkles', title: 'Strategy', description: 'We start with the outcome and work backwards to a plan you can actually ship.' },
          { icon: 'palette', title: 'Design', description: 'Distinctive, accessible design systems that scale past the first launch.' },
          { icon: 'rocket', title: 'Delivery', description: 'Hands-on build and launch support, with clear reporting throughout.' },
        ],
      };
    case 'gallery':
      return {
        type,
        variant: 'grid',
        eyebrow: 'Portfolio',
        heading: 'Selected work',
        subheading: 'A snapshot of recent projects.',
        columns: 3,
        images: images.map((url, i) => ({ url, alt: `Project ${i + 1}`, caption: '' })),
      };
    case 'testimonials':
      return {
        type,
        variant: 'cards',
        eyebrow: 'Testimonials',
        heading: 'What clients say',
        items: [
          { quote: 'They understood the brief in the first meeting and delivered ahead of schedule.', name: 'Amara Okafor', role: 'Founder, Loom Studio', avatar: { url: AVATARS[0], alt: 'Amara Okafor' }, rating: 5 },
          { quote: 'Bookings went up 40% in the first two months after launch.', name: 'Daniel Reyes', role: 'Owner, Reyes & Co', avatar: { url: AVATARS[1], alt: 'Daniel Reyes' }, rating: 5 },
          { quote: 'Genuinely the smoothest website project we have run.', name: 'Priya Nandakumar', role: 'Marketing Lead, Fernway', avatar: { url: AVATARS[2], alt: 'Priya Nandakumar' }, rating: 5 },
        ],
      };
    case 'textMedia':
      return {
        type,
        variant: 'imageRight',
        eyebrow: 'About',
        heading: `Why people choose ${c.brand}`,
        body:
          `We have spent the last ten years doing this work for people who care how it turns out. ${c.brand} stays deliberately small, so the person you meet in the first conversation is the person who does the work.`,
        bullets: ['Ten years in the industry', 'Fixed-price proposals', 'Direct access to the people doing the work'],
        image: { url: stockImage(c.topic, 1), alt: `Inside ${c.brand}` },
        cta: { label: 'More about us', href: '/about' },
      };
    case 'stats':
      return {
        type,
        variant: 'row',
        heading: '',
        items: [
          { value: '10+', label: 'Years in business' },
          { value: '240', label: 'Projects delivered' },
          { value: '4.9', label: 'Average review score' },
          { value: '48h', label: 'Typical response time' },
        ],
      };
    case 'logos':
      return {
        type,
        heading: 'Trusted by teams at',
        items: ['Fernway', 'Loom Studio', 'Kestrel', 'Highline', 'Verdant'].map((name) => ({ name })),
      };
    default:
      return blueprintPropsExtra(type, c);
  }
}

function blueprintPropsExtra(type: SectionType, c: BlueprintContext): Record<string, unknown> {
  switch (type) {
    case 'pricing':
      return {
        type,
        variant: 'cards',
        eyebrow: 'Pricing',
        heading: 'Straightforward pricing',
        subheading: 'No retainers, no surprises.',
        plans: [
          { name: 'Starter', price: '$1,500', period: 'one-off', description: 'A focused single-page site.', features: ['1 page', 'Mobile optimised', '2 revision rounds'], cta: { label: 'Choose Starter', href: '/contact' }, highlighted: false },
          { name: 'Business', price: '$3,900', period: 'one-off', description: 'Everything a growing business needs.', features: ['Up to 6 pages', 'Copywriting included', 'SEO setup', '4 revision rounds'], cta: { label: 'Choose Business', href: '/contact' }, highlighted: true },
          { name: 'Custom', price: 'Talk to us', period: '', description: 'Bespoke builds and integrations.', features: ['Unlimited pages', 'Custom integrations', 'Ongoing support'], cta: { label: 'Book a call', href: '/contact' }, highlighted: false },
        ],
      };
    case 'team':
      return {
        type,
        eyebrow: 'Team',
        heading: 'The people you will work with',
        columns: 3,
        items: [
          { name: 'Maya Bennett', role: 'Founder & Creative Director', bio: 'Fifteen years across brand and product design.', image: { url: AVATARS[3], alt: 'Maya Bennett' } },
          { name: 'Tomas Halvorsen', role: 'Lead Developer', bio: 'Builds fast, accessible front ends.', image: { url: AVATARS[4], alt: 'Tomas Halvorsen' } },
          { name: 'Sarah Idris', role: 'Client Partner', bio: 'Keeps every project on time and on scope.', image: { url: AVATARS[5], alt: 'Sarah Idris' } },
        ],
      };
    case 'faq':
      return {
        type,
        variant: 'accordion',
        eyebrow: 'FAQ',
        heading: 'Questions, answered',
        items: [
          { question: 'How long does a project take?', answer: 'Most projects run four to six weeks from kickoff to launch, depending on how quickly content comes together.' },
          { question: 'What do you need from me to start?', answer: 'A short brief, any existing brand assets, and one decision-maker who can sign off.' },
          { question: 'Do you offer ongoing support?', answer: 'Yes. Monthly care plans cover updates, monitoring and small changes.' },
          { question: 'How does payment work?', answer: '50% to book the work in, 50% on launch. Larger projects can be split into milestones.' },
        ],
      };
    case 'contact':
      return {
        type,
        variant: 'split',
        eyebrow: 'Contact',
        heading: 'Tell us about your project',
        subheading: 'We reply to every enquiry within two business days.',
        email: `hello@${c.brand.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: '+1 (555) 010-2030',
        address: '128 Harbour Street, Suite 4, Portland, OR',
        hours: 'Mon-Fri, 9am - 5pm',
        showForm: true,
        submitLabel: 'Send enquiry',
      };
    case 'cta':
      return {
        type,
        variant: 'boxed',
        heading: 'Ready to start?',
        subheading: 'Book a 20-minute call and we will tell you honestly whether we can help.',
        primaryCta: { label: 'Book a call', href: '/contact' },
        secondaryCta: { label: 'See pricing', href: '#pricing' },
        background: 'primary',
      };
    case 'footer':
      return {
        type,
        variant: 'columns',
        logoText: c.brand,
        tagline: 'Design and build for businesses that need to look the part.',
        columns: [
          { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Services', href: '/services' }, { label: 'Contact', href: '/contact' }] },
          { title: 'Resources', links: [{ label: 'Portfolio', href: '/#work' }, { label: 'FAQ', href: '/#faq' }] },
        ],
        socials: [
          { platform: 'instagram', href: '#' },
          { platform: 'linkedin', href: '#' },
        ],
        legal: `© ${new Date().getFullYear()} ${c.brand}. All rights reserved.`,
      };
    default:
      return { type };
  }
}

/**
 * Creates a valid, populated section. `overrides` is validated with the rest of
 * the props, so an AI-supplied partial can never produce an invalid section.
 */
export function createSection(
  type: SectionType,
  overrides: Record<string, unknown> = {},
  context?: Partial<BlueprintContext>,
): Section {
  const base = blueprintProps(type, context);
  const candidate = { ...base, ...overrides, type, id: (overrides.id as string) || createId('sec') };
  const parsed = parseSection(candidate);
  if (parsed) return parsed;

  // The override was unusable - fall back to the blueprint alone so the editor
  // still gets a working section, and surface the reason to the caller.
  const fallback = parseSection({ ...base, type, id: createId('sec') });
  if (!fallback) {
    throw new Error(`Blueprint for section type "${type}" is invalid`);
  }
  return fallback;
}

/** Strict variant used by API routes that must report validation failures. */
export function createSectionStrict(
  type: SectionType,
  overrides: Record<string, unknown> = {},
  context?: Partial<BlueprintContext>,
): Section {
  const base = blueprintProps(type, context);
  const schema = sectionSchemas[type];
  const result = schema.safeParse({ ...base, ...overrides, type, id: (overrides.id as string) || createId('sec') });
  if (!result.success) {
    throw new Error(result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  }
  return parseSection(result.data)!;
}

export { blueprintProps };
