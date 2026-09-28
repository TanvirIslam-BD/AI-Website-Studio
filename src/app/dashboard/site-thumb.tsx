'use client';

import { useEffect, useRef, useState } from 'react';

/** Width the site is laid out at before being scaled into the card. */
const RENDER_WIDTH = 1280;

/** Card width assumed for the first paint, before the real width is measured. */
const INITIAL_WIDTH = 352;

/**
 * Scales a desktop-width rendered site to whatever width its card has.
 *
 * The cards are fluid, so the scale cannot be fixed at build time the way the
 * home page's reel is. A ResizeObserver keeps it exact; the first paint uses a
 * typical card width so nothing jumps noticeably before it measures. The page
 * scrolls through the frame while the card (`.group`) is hovered - the same
 * `.site-scroll` rule the home page uses, fed the live scale and frame height.
 */
export function SiteThumb({ children, ratio = 10 / 16 }: { children: React.ReactNode; ratio?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(INITIAL_WIDTH);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const height = Math.round(width * ratio);
  const scale = width / RENDER_WIDTH;

  return (
    <div ref={ref} className="relative w-full overflow-hidden bg-white" style={{ height }} aria-hidden inert>
      <div
        className="site-scroll origin-top-left"
        style={{ width: RENDER_WIDTH, '--s': scale, '--h': `${height}px` } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}
