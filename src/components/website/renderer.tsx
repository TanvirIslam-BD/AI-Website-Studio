import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import type { Section } from '@/lib/website/sections';
import type { Page, WebsiteDocument } from '@/lib/website/document';
import { themeToCssVars, type Theme } from '@/lib/website/theme';
import type { SectionViewProps } from './primitives';
import { HeaderSection } from './sections/Header';
import { HeroSection } from './sections/Hero';
import { FeaturesSection } from './sections/Features';
import { GallerySection } from './sections/Gallery';
import { TestimonialsSection } from './sections/Testimonials';
import { TextMediaSection } from './sections/TextMedia';
import { StatsSection } from './sections/Stats';
import { LogosSection } from './sections/Logos';
import { PricingSection } from './sections/Pricing';
import { TeamSection } from './sections/Team';
import { FaqSection } from './sections/Faq';
import { ContactSection } from './sections/Contact';
import { CtaSection } from './sections/Cta';
import { FooterSection } from './sections/Footer';

/**
 * The renderer registry: section type -> component.
 *
 * This is the only place that maps content to presentation. The editor canvas,
 * the /preview route and the static export all render through here, which is
 * why "what you see" genuinely matches "what you deploy".
 */
const REGISTRY: { [K in Section['type']]: (props: SectionViewProps<Extract<Section, { type: K }>>) => ReactNode } = {
  header: HeaderSection,
  hero: HeroSection,
  features: FeaturesSection,
  gallery: GallerySection,
  testimonials: TestimonialsSection,
  textMedia: TextMediaSection,
  stats: StatsSection,
  logos: LogosSection,
  pricing: PricingSection,
  team: TeamSection,
  faq: FaqSection,
  contact: ContactSection,
  cta: CtaSection,
  footer: FooterSection,
};

export type HrefResolver = (href: string) => string;

export function SectionView({ section, theme, hrefFor }: SectionViewProps) {
  const Component = REGISTRY[section.type] as (props: SectionViewProps) => ReactNode;
  if (!Component) return null;
  return <Component section={section} theme={theme} hrefFor={hrefFor} />;
}

/**
 * Wraps content in the theme's CSS variables. Every colour/font/radius token a
 * section reads is defined here, so a subtree can be re-themed in isolation
 * (the editor uses that to render a live theme preview).
 */
export function ThemeScope({
  theme,
  children,
  className = '',
  style,
  as: Tag = 'div',
  onClickCapture,
}: {
  theme: Theme;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'main' | 'body';
  /** Used by the editor canvas to intercept clicks before links navigate. */
  onClickCapture?: MouseEventHandler<HTMLElement>;
}) {
  return (
    <Tag
      className={className}
      onClickCapture={onClickCapture}
      style={{
        ...(themeToCssVars(theme) as CSSProperties),
        background: 'var(--ws-bg)',
        color: 'var(--ws-text)',
        fontFamily: 'var(--ws-font-body)',
        ...style,
      }}
      data-ws-theme={theme.mode}
    >
      {children}
    </Tag>
  );
}

/** Renders one page's sections. Hidden sections are skipped everywhere. */
export function PageView({
  page,
  theme,
  hrefFor,
  includeHidden = false,
}: {
  page: Page;
  theme: Theme;
  hrefFor?: HrefResolver;
  includeHidden?: boolean;
}) {
  const sections = includeHidden ? page.sections : page.sections.filter((s) => !s.hidden);
  return (
    <>
      {sections.map((section) => (
        <SectionView key={section.id} section={section} theme={theme} hrefFor={hrefFor} />
      ))}
    </>
  );
}

/** Full standalone page: theme scope + sections. Used by preview and export. */
export function WebsiteView({
  document: doc,
  page,
  hrefFor,
  className = '',
}: {
  document: WebsiteDocument;
  page: Page;
  hrefFor?: HrefResolver;
  className?: string;
}) {
  return (
    <ThemeScope theme={doc.theme} className={className} style={{ minHeight: '100%' }}>
      <PageView page={page} theme={doc.theme} hrefFor={hrefFor} />
    </ThemeScope>
  );
}

// --- href resolvers --------------------------------------------------------

const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//');

/** Rewrites internal links to the studio's preview route. */
export function previewHrefResolver(projectId: string): HrefResolver {
  return (href) => {
    if (!isInternal(href)) return href;
    const clean = href.replace(/^\/+/, '');
    return clean ? `/preview/${projectId}/${clean}` : `/preview/${projectId}`;
  };
}

/**
 * Editor canvas: internal navigation is disabled so a click never yanks the
 * user out of the editor. Hash links are kept so in-page anchors still work.
 */
export const canvasHrefResolver: HrefResolver = (href) => (isInternal(href) ? '#' : href);

/** Deployed site: internal links stay as clean paths (Vercel cleanUrls). */
export const exportHrefResolver: HrefResolver = (href) => href;

export { REGISTRY as SECTION_REGISTRY };
