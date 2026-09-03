'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { SECTION_META, type Section } from '@/lib/website/sections';
import { SectionView, ThemeScope, canvasHrefResolver } from '@/components/website/renderer';
import { DEVICE_WIDTH, useActivePage, useEditor } from './store';
import { CanvasIframe } from './canvas-iframe';
import { SectionFrame } from './section-frame';

/** Horizontal breathing room around the device frame. */
const CANVAS_GUTTER = 56;

/**
 * The editor canvas.
 *
 * Renders the real section components at the target device width inside an
 * iframe (see CanvasIframe for why), then scales the frame to fit. Selection
 * chrome is an overlay drawn per section: the section components themselves
 * stay editor-agnostic, which is what lets the same code render the deployed
 * site.
 */
export function Canvas() {
  const page = useActivePage();
  const theme = useEditor((state) => state.document.theme);
  const device = useEditor((state) => state.device);
  const selectedId = useEditor((state) => state.selectedSectionId);
  const select = useEditor((state) => state.select);
  const run = useEditor((state) => state.run);

  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const targetWidth = DEVICE_WIDTH[device];

  // A callback ref, not useRef: the container mounts only once the document has
  // loaded, and an effect keyed on a ref object would miss that.
  useLayoutEffect(() => {
    if (!viewport) return;

    const measure = () => {
      const available = viewport.clientWidth - CANVAS_GUTTER;
      setScale(Math.min(1, Math.max(0.2, available / targetWidth)));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [viewport, targetWidth]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') select(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [select]);

  const sections = page?.sections ?? [];

  return (
    <div ref={setViewport} className="studio-scroll relative h-full overflow-auto bg-ink-100/70">
      <div className="studio-grid absolute inset-0 opacity-40" aria-hidden />

      <div className="relative flex justify-center px-7 py-7">
        <CanvasIframe
          width={targetWidth}
          scale={scale}
          onBackgroundClick={() => select(null)}
          className="overflow-hidden rounded-xl border border-ink-300/60 bg-white shadow-pop"
        >
          <ThemeScope
            theme={theme}
            onClickCapture={(event) => {
              // Clicks select sections; nothing inside the canvas navigates.
              const target = event.target as HTMLElement;
              if (target.closest('a,button,summary,input,textarea,select')) event.preventDefault();
            }}
          >
            {sections.length === 0 ? (
              <div className="grid min-h-[420px] place-items-center p-10 text-center">
                <div>
                  <p className="text-sm font-semibold text-ink-800">This page is empty</p>
                  <p className="mt-1 text-[13px] text-ink-500">Add a section from the left panel to get started.</p>
                </div>
              </div>
            ) : (
              sections.map((section: Section, index: number) => (
                <SectionFrame
                  key={section.id}
                  label={SECTION_META[section.type].label}
                  hidden={section.hidden}
                  structural={section.type === 'header' || section.type === 'footer'}
                  index={index}
                  total={sections.length}
                  selected={section.id === selectedId}
                  scale={scale}
                  onSelect={() => select(section.id)}
                  onMove={(direction) => run('move_section', { sectionId: section.id, direction })}
                  onDuplicate={() => run('duplicate_section', { sectionId: section.id })}
                  onToggle={() => run('toggle_section', { sectionId: section.id, hidden: !section.hidden })}
                  onDelete={() => run('delete_section', { sectionId: section.id })}
                >
                  <SectionView section={section} theme={theme} hrefFor={canvasHrefResolver} />
                </SectionFrame>
              ))
            )}
          </ThemeScope>
        </CanvasIframe>
      </div>

      <div className="pointer-events-none sticky bottom-3 left-0 flex justify-center">
        <span className="rounded-full border border-ink-200 bg-white/95 px-2.5 py-1 font-mono text-[11px] text-ink-500 shadow-panel">
          {targetWidth}px · {Math.round(scale * 100)}%
        </span>
      </div>
    </div>
  );
}
