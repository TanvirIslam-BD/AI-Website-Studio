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
} as const;

/**
 * The legal entity behind the product, used in the footer and structured data.
 * Distinct from BRAND.name: the product is Web Copilot AI Studio, the company
 * that publishes it is My Copilot AI LLC.
 */
export const COMPANY = {
  legalName: 'My Copilot AI LLC',
  address: ['117 S Lexington St, Ste 100', 'Harrisonville, MO 64701-2444', 'USA'],
  supportEmail: 'support@contact.copilotai.live',
} as const;

/**
 * Social profiles.
 *
 * Only entries with an `href` are rendered, so an unfinished profile never
 * ships as a dead link - paste the URL in and the icon appears.
 */
export type SocialPlatform = 'instagram' | 'threads' | 'x' | 'tiktok' | 'linkedin' | 'facebook' | 'email';

export const SOCIAL_LINKS: Array<{ platform: SocialPlatform; label: string; href: string }> = [
  { platform: 'instagram', label: 'Instagram', href: '' },
  { platform: 'threads', label: 'Threads', href: '' },
  { platform: 'x', label: 'X', href: '' },
  { platform: 'tiktok', label: 'TikTok', href: '' },
  { platform: 'linkedin', label: 'LinkedIn', href: '' },
  { platform: 'facebook', label: 'Facebook', href: '' },
  { platform: 'email', label: 'Email us', href: `mailto:${COMPANY.supportEmail}` },
];

export const NAV_LINKS = [
  { label: 'Examples', href: '#examples' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Sections', href: '#sections' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
] as const;
