'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * The scrolling rail for the generated-site gallery.
 *
 * A client wrapper around server-rendered children: the previews are real
 * websites rendered on the server, and nothing about them needs to ship as
 * JavaScript. Only the scrolling does.
 *
 * Native overflow with scroll snapping does the actual work, so touch, trackpad
 * and keyboard all behave the way the platform already does. The buttons are an
 * addition for mouse users on desktop, not the mechanism - which is why they
 * are hidden from assistive tech and the rail itself is focusable and labelled.
 */
export function ShowcaseSlider({ children, label }: { children: React.ReactNode; label: string }) {
  const rail = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const node = rail.current;
    if (!node) return;
    setAtStart(node.scrollLeft < 8);
    // A couple of pixels of slack: sub-pixel widths mean the end rarely lands
    // exactly on the maximum.
    setAtEnd(node.scrollLeft + node.clientWidth >= node.scrollWidth - 8);
  }, []);

  useEffect(() => {
    sync();
    const node = rail.current;
    if (!node) return;
    node.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      node.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync]);

  const page = (direction: 1 | -1) => {
    const node = rail.current;
    if (!node) return;
    // Roughly one card, so a click advances the gallery rather than jumping it.
    node.scrollBy({ left: direction * Math.min(node.clientWidth * 0.8, 420), behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={rail}
        // Focusable and labelled, so the rail is reachable and scrollable by
        // keyboard even though the buttons are decorative.
        tabIndex={0}
        role="region"
        aria-label={label}
        className="studio-scroll -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-4 sm:-mx-8 sm:px-8"
      >
        {children}
      </div>

      {/* Edge fades, so a cut-off card reads as "more this way". */}
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent transition-opacity duration-200 ${atStart ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent transition-opacity duration-200 ${atEnd ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden
      />

      <div className="mt-2 hidden justify-end gap-2 md:flex">
        <button
          type="button"
          onClick={() => page(-1)}
          disabled={atStart}
          aria-hidden
          tabIndex={-1}
          className="focus-ring grid h-9 w-9 place-items-center rounded-lg border border-ink-200 bg-white text-ink-700 transition-colors hover:border-ink-300 hover:text-ink-950 disabled:opacity-35"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => page(1)}
          disabled={atEnd}
          aria-hidden
          tabIndex={-1}
          className="focus-ring grid h-9 w-9 place-items-center rounded-lg border border-ink-200 bg-white text-ink-700 transition-colors hover:border-ink-300 hover:text-ink-950 disabled:opacity-35"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
