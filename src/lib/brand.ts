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

/** Anchor navigation for the marketing site, shared by the nav and the footer. */
export const NAV_LINKS = [
  { label: 'Examples', href: '#examples' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Sections', href: '#sections' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
] as const;

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
  { platform: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/mycopilotai' },
  { platform: 'threads', label: 'Threads', href: 'https://www.threads.com/@mycopilotai' },
  { platform: 'x', label: 'X', href: 'https://x.com/MyCopilotAI' },
  { platform: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@mycopilotai' },
  { platform: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/my-copilot-ai/' },
  { platform: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61588721369176' },
  {
    platform: 'email',
    label: 'Email support',
    // Prefilled subject so enquiries from this product are recognisable in a
    // shared inbox.
    href: `mailto:${COMPANY.supportEmail}?subject=${encodeURIComponent(`${BRAND.name} support request`)}`,
  },
];
