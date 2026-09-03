import type { CSSProperties, ReactNode } from 'react';
import {
  Award, Briefcase, Camera, Check, Clock, Coffee, Globe, Heart, Layers, Leaf,
  Mail, MapPin, Palette, Phone, Rocket, Scissors, Shield, Sparkles, Star,
  TrendingUp, Truck, Users, Wrench, Zap, type LucideIcon,
} from 'lucide-react';
import type { Theme } from '@/lib/website/theme';
import type { Section } from '@/lib/website/sections';
import { safeHref } from '@/lib/website/sections';

/**
 * Rendering primitives for generated websites.
 *
 * Layout comes from Tailwind utility classes; every colour, font, radius and
 * spacing value comes from the CSS variables emitted by the theme engine. That
 * separation is what lets the identical component tree render in the editor
 * canvas, the preview route and the static HTML export.
 *
 * Deliberately uses plain <img> rather than next/image: the export is framework
 * agnostic and must not depend on a Next.js image optimiser at runtime.
 */

export type Background = 'default' | 'surface' | 'primary' | 'inverse';

const BACKGROUND_VARS: Record<Background, CSSProperties> = {
  default: { ['--sec-bg' as string]: 'var(--ws-bg)', ['--sec-fg' as string]: 'var(--ws-text)', ['--sec-border' as string]: 'var(--ws-border)' },
  surface: { ['--sec-bg' as string]: 'var(--ws-surface)', ['--sec-fg' as string]: 'var(--ws-text)', ['--sec-border' as string]: 'var(--ws-border)' },
  primary: { ['--sec-bg' as string]: 'var(--ws-primary)', ['--sec-fg' as string]: 'var(--ws-primary-fg)', ['--sec-border' as string]: 'rgba(255,255,255,0.22)' },
  inverse: { ['--sec-bg' as string]: 'var(--ws-inverse)', ['--sec-fg' as string]: 'var(--ws-inverse-fg)', ['--sec-border' as string]: 'rgba(255,255,255,0.16)' },
};

const PADDING: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: '0px',
  sm: 'calc(var(--ws-section-y) * 0.5)',
  md: 'var(--ws-section-y)',
  lg: 'calc(var(--ws-section-y) * 1.5)',
};

export function isInverted(background: Background): boolean {
  return background === 'primary' || background === 'inverse';
}

/** Outer band of a section: background, vertical rhythm, local colour vars. */
export function SectionShell({
  background = 'default',
  paddingY = 'md',
  children,
  className = '',
  id,
  style,
}: {
  background?: Background;
  paddingY?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  id?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      id={id}
      className={`relative w-full ${className}`}
      style={{
        ...BACKGROUND_VARS[background],
        background: 'var(--sec-bg)',
        color: 'var(--sec-fg)',
        paddingTop: PADDING[paddingY],
        paddingBottom: PADDING[paddingY],
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export function Container({ children, className = '', wide = false }: { children: ReactNode; className?: string; wide?: boolean }) {
  return <div className={`mx-auto w-full ${wide ? 'max-w-7xl' : 'max-w-6xl'} px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p
      className="mb-3 text-xs font-semibold uppercase tracking-[0.14em]"
      style={{ color: 'var(--ws-primary)', fontFamily: 'var(--ws-font-body)' }}
    >
      {children}
    </p>
  );
}

export function Heading({
  children,
  level = 2,
  className = '',
}: {
  children?: ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  if (!children) return null;
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';
  const size =
    level === 1
      ? 'text-4xl sm:text-5xl lg:text-6xl leading-[1.05]'
      : level === 2
        ? 'text-3xl sm:text-4xl leading-[1.12]'
        : level === 3
          ? 'text-xl sm:text-2xl leading-snug'
          : 'text-base sm:text-lg leading-snug';
  return (
    <Tag
      className={`font-bold tracking-[-0.02em] ${size} ${className}`}
      style={{ fontFamily: 'var(--ws-font-heading)', color: 'var(--sec-fg)' }}
    >
      {children}
    </Tag>
  );
}

/** Body copy. `opacity` gives us a muted tone that works on any background. */
export function Prose({ children, className = '', size = 'md' }: { children?: ReactNode; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  if (!children) return null;
  const scale = size === 'lg' ? 'text-lg sm:text-xl' : size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <p
      className={`${scale} leading-relaxed ${className}`}
      style={{ fontFamily: 'var(--ws-font-body)', color: 'var(--sec-fg)', opacity: 0.74 }}
    >
      {children}
    </p>
  );
}

export type LinkValue = { label: string; href: string };

/**
 * Themed button. `theme.buttonStyle` decides the shape/fill, `inverted` flips
 * it for bands that already use the primary colour as their background.
 */
export function Button({
  link,
  theme,
  tone = 'primary',
  inverted = false,
  size = 'md',
}: {
  link?: LinkValue;
  theme: Theme;
  tone?: 'primary' | 'secondary';
  inverted?: boolean;
  size?: 'md' | 'lg';
}) {
  if (!link?.label) return null;

  const radius = theme.buttonStyle === 'pill' ? 'var(--ws-radius-pill)' : 'var(--ws-radius)';
  const padding = size === 'lg' ? 'px-7 py-3.5 text-[15px]' : 'px-5 py-2.5 text-sm';
  const base: CSSProperties = { borderRadius: radius, fontFamily: 'var(--ws-font-body)', borderWidth: 1, borderStyle: 'solid' };

  let style: CSSProperties;
  if (tone === 'primary') {
    if (inverted) {
      style = { ...base, background: 'var(--sec-fg)', color: 'var(--sec-bg)', borderColor: 'var(--sec-fg)' };
    } else if (theme.buttonStyle === 'outline') {
      style = { ...base, background: 'transparent', color: 'var(--ws-primary)', borderColor: 'var(--ws-primary)' };
    } else if (theme.buttonStyle === 'soft') {
      style = { ...base, background: 'var(--ws-primary-soft)', color: 'var(--ws-primary)', borderColor: 'transparent' };
    } else {
      style = { ...base, background: 'var(--ws-primary)', color: 'var(--ws-primary-fg)', borderColor: 'var(--ws-primary)' };
    }
  } else {
    style = {
      ...base,
      background: 'transparent',
      color: 'var(--sec-fg)',
      borderColor: inverted ? 'var(--sec-border)' : 'var(--ws-border)',
    };
  }

  return (
    <a
      href={safeHref(link.href)}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-opacity hover:opacity-85 ${padding}`}
      style={style}
    >
      {link.label}
    </a>
  );
}

export function Img({
  src,
  alt = '',
  className = '',
  style,
  ratio,
}: {
  src?: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  ratio?: string;
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ background: 'var(--ws-surface)', borderRadius: 'var(--ws-radius-lg)', aspectRatio: ratio, ...style }}
      >
        <span className="text-xs font-medium opacity-40">No image</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`object-cover ${className}`}
      style={{ borderRadius: 'var(--ws-radius-lg)', aspectRatio: ratio, ...style }}
    />
  );
}

/** Bordered content card that follows the theme radius and mode. */
export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`h-full ${className}`}
      style={{
        background: 'var(--ws-bg)',
        border: '1px solid var(--sec-border)',
        borderRadius: 'var(--ws-radius-lg)',
        color: 'var(--ws-text)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles, camera: Camera, heart: Heart, star: Star, shield: Shield,
  zap: Zap, clock: Clock, users: Users, award: Award, palette: Palette,
  globe: Globe, phone: Phone, mail: Mail, 'map-pin': MapPin, check: Check,
  'trending-up': TrendingUp, briefcase: Briefcase, rocket: Rocket, layers: Layers,
  wrench: Wrench, leaf: Leaf, coffee: Coffee, scissors: Scissors, truck: Truck,
};

export function Icon({ name, className = 'h-5 w-5' }: { name?: string; className?: string }) {
  const Component = ICONS[name ?? 'sparkles'] ?? Sparkles;
  return <Component className={className} strokeWidth={1.75} aria-hidden />;
}

export const GRID_COLUMNS: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

/** Shared props every section component receives from the renderer. */
export type SectionViewProps<T extends Section = Section> = {
  section: T;
  theme: Theme;
  /** Resolves an internal page path for the current rendering target. */
  hrefFor?: (href: string) => string;
  /**
   * Set when the tree is embedded inside another document as illustration -
   * the marketing site's product showcase, for example.
   *
   * Anchor ids and heading levels are page-level concerns. Emitting them from
   * an embedded copy produces duplicate ids (so "#faq" jumps to the wrong
   * place) and a second h1 competing with the host page's own.
   */
  decorative?: boolean;
};

/** Anchor id for a section, omitted when the tree is only illustration. */
export function anchorId(id: string, decorative?: boolean): string | undefined {
  return decorative ? undefined : id;
}

export function resolveLink(link: LinkValue | undefined, hrefFor?: (href: string) => string): LinkValue | undefined {
  if (!link) return undefined;
  return { label: link.label, href: hrefFor ? hrefFor(link.href) : link.href };
}
