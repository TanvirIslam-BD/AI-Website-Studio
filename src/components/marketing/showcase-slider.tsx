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
export function ShowcaseSlider({
  children,
  label,
  /**
   * The colour the rail sits on, as a 6-digit hex. The edge fades are drawn in
   * it, so they have to match the section's surface - a white fade over the
   * muted surface reads as a smear rather than as the rail running out.
   *
   * Faded to the same colour at zero alpha rather than to `transparent`, which
   * is rgba(0,0,0,0) and interpolates through grey on the way there.
   */
  surface = '#ffffff',
}: {
  children: React.ReactNode;
  label: string;
  surface?: string;
}) {
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
      {/*
        The bleed lives here rather than on the rail itself, so the fades can be
        positioned against the rail's real edges. With the negative margin on
        the rail, `left-0` on this wrapper landed a gutter's width inside the
        cards - a white band down the middle of the first one instead of a fade
        at the cut.
      */}
      <div className="relative -mx-5 sm:-mx-8">
        <div
          ref={rail}
          // Focusable and labelled, so the rail is reachable and scrollable by
          // keyboard even though the buttons are decorative.
          tabIndex={0}
          role="region"
          aria-label={label}
          // `scroll-px` matters as much as `px` here: snap positions are
          // measured against the scroll padding, and without it a mandatory
          // snap immediately scrolls the gutter away. The rail then sat at
          // scrollLeft 32 at rest, which read as "already scrolled" - the start
          // fade never turned off and the first card lost its inset.
          className="studio-scroll flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth scroll-px-5 px-5 pb-4 sm:scroll-px-8 sm:px-8"
        >
          {children}
        </div>

        {/* Edge fades, so a cut-off card reads as "more this way". Stopping
            above the scrollbar gutter, which should not be tinted. */}
        <div
          className={`pointer-events-none absolute bottom-4 left-0 top-0 w-14 transition-opacity duration-200 ${atStart ? 'opacity-0' : 'opacity-100'}`}
          style={{ background: `linear-gradient(to right, ${surface}, ${surface}00)` }}
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute bottom-4 right-0 top-0 w-14 transition-opacity duration-200 ${atEnd ? 'opacity-0' : 'opacity-100'}`}
          style={{ background: `linear-gradient(to left, ${surface}, ${surface}00)` }}
          aria-hidden
        />
      </div>

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
