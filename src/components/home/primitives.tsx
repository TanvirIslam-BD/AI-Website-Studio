import { Geist } from 'next/font/google';
import type { WebsiteDocument } from '@/lib/website/document';
import { homePage } from '@/lib/website/document';
import { PageView, ThemeScope } from '@/components/website/renderer';
import { cn } from '@/lib/utils';

/**
 * Building blocks for the home page.
 *
 * The home page is one continuous dark surface, so it has its own small set of
 * primitives rather than the light-first ones in `marketing/shell` - those
 * still serve the standalone pages and stay as they are.
 */

/** The display and body face for the home page. Scoped to it via className. */
export const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[1200px] px-5 sm:px-8', className)}>{children}</div>;
}

/** A page band. `scroll-mt` clears the floating nav when jumped to by anchor. */
export function Band({ id, children, className }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={cn('relative scroll-mt-24 py-24 sm:py-32', className)}>
      {children}
    </section>
  );
}

/** Small label above a heading. */
export function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[12px] font-medium text-white/60',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-indigo-300 to-sky-300" aria-hidden />
      {children}
    </p>
  );
}

/** Section heading: kicker, title, optional lede. */
export function Heading({
  kicker,
  title,
  lede,
  align = 'center',
  className,
}: {
  kicker?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <div className={cn('reveal max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {kicker ? <Kicker>{kicker}</Kicker> : null}
      <h2 className="text-gradient mt-5 text-balance text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[3.25rem]">
        {title}
      </h2>
      {lede ? (
        <p
          className={cn(
            'mt-5 max-w-2xl text-pretty text-[16px] leading-relaxed text-white/55 sm:text-[17px]',
            align === 'center' && 'mx-auto',
          )}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A glass panel with a lit top edge. The gradient border is drawn by the
 * `.glass` rule in globals.css so the corners stay crisp at any radius.
 */
export function Glass({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('glass relative rounded-3xl', className)}>{children}</div>;
}

/** Window chrome around a product capture. */
export function Screenshot({
  src,
  alt,
  className,
  priority = false,
  label,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  label?: string;
}) {
  return (
    <figure className={cn('overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d12]', className)}>
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-3.5 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </span>
        {label ? <span className="ml-2 truncate font-mono text-[11px] text-white/35">{label}</span> : null}
      </div>
      {/* Real pixel dimensions, so the box is reserved before the file arrives. */}
      <img
        src={src}
        alt={alt}
        width={1600}
        height={900}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="block aspect-video w-full object-cover object-top"
      />
    </figure>
  );
}

/** The width generated pages are rendered at before being scaled into a frame. */
const RENDER_WIDTH = 1280;

/**
 * A generated website, rendered live and scaled into a box.
 *
 * Not a picture: the document comes from the generator and goes through the
 * same section components a deployed site uses. It carries its own headings,
 * ids and links, so `decorative` drops the ids, `aria-hidden` keeps the
 * headings out of the outline and `inert` keeps the links out of the tab order.
 */
export function SiteRender({
  document,
  width,
  height,
  scrollOnHover = false,
}: {
  document: WebsiteDocument;
  width: number;
  height: number;
  /**
   * Scroll the whole page through the frame while an ancestor `.group` is
   * hovered. The transform itself lives in `.site-scroll` in globals.css,
   * driven by the scale and frame height passed as custom properties.
   */
  scrollOnHover?: boolean;
}) {
  const scale = width / RENDER_WIDTH;
  return (
    <div className="overflow-hidden bg-white" style={{ width, height }} aria-hidden inert>
      <div
        className={cn('origin-top-left', scrollOnHover && 'site-scroll')}
        style={
          scrollOnHover
            ? ({ width: RENDER_WIDTH, '--s': scale, '--h': `${height}px` } as React.CSSProperties)
            : { width: RENDER_WIDTH, transform: `scale(${scale})` }
        }
      >
        <ThemeScope theme={document.theme}>
          <PageView page={homePage(document)} theme={document.theme} hrefFor={() => '#'} decorative />
        </ThemeScope>
      </div>
    </div>
  );
}

/** `aperture-light.vercel.app` style host for a generated brand. */
export function hostFor(brand: string) {
  return `${brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.vercel.app`;
}
