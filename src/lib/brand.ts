/**
 * Product identity.
 *
 * One place for the name and public copy so the marketing site, the app chrome,
 * page metadata and the AI system prompts can never disagree.
 */
export const BRAND = {
  name: 'Web Copilot AI Studio',
  shortName: 'Web Copilot',
  /** The brand slogan, as it appears in the logo lockup. */
  slogan: 'Build Smart · Launch Faster',
  /** Longer descriptive line, used for page titles and link previews. */
  tagline: 'From a sentence to a deployed website',
  description:
    'Describe your business and get a real, editable, multi-page website. Refine it in a visual editor, direct it with an AI copilot, and deploy to Vercel in one click.',
  /** Used in the footer and structured data. */
  company: 'Web Copilot AI Studio',
} as const;

export const NAV_LINKS = [
  { label: 'Examples', href: '#examples' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Sections', href: '#sections' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
] as const;
