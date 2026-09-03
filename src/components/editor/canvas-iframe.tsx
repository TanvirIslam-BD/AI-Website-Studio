'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * The canvas renders into an iframe rather than a scaled `div`.
 *
 * This matters for correctness, not aesthetics: CSS media queries resolve
 * against the *layout viewport*. In a scaled div, a 390px-wide "mobile"
 * preview would still match `lg:` breakpoints and show the desktop layout. An
 * iframe sized to the device width gives each breakpoint its real value, so the
 * tablet and mobile previews match the deployed site exactly.
 *
 * React still owns the content: it is portalled into the iframe's body, so
 * click-to-select, hover chrome and live updates all work as if it were inline.
 */
export function CanvasIframe({
  width,
  scale,
  children,
  className,
  onBackgroundClick,
}: {
  width: number;
  scale: number;
  children: React.ReactNode;
  className?: string;
  onBackgroundClick?: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [contentHeight, setContentHeight] = useState(600);

  /** Mirrors the studio's stylesheets into the iframe so Tailwind applies. */
  const syncStyles = useCallback((doc: Document) => {
    const head = doc.head;
    const existing = new Set(Array.from(head.querySelectorAll('[data-studio-style]')).map((node) => node.getAttribute('data-studio-style')));

    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node, index) => {
      const key = `${node.nodeName}-${index}-${node.getAttribute('href') ?? node.textContent?.length ?? ''}`;
      if (existing.has(key)) return;
      const clone = node.cloneNode(true) as HTMLElement;
      clone.setAttribute('data-studio-style', key);
      head.appendChild(clone);
    });
  }, []);

  const attach = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    doc.body.style.margin = '0';
    doc.documentElement.style.background = 'transparent';
    syncStyles(doc);
    setMountNode(doc.body);

    const measure = () => setContentHeight(Math.max(doc.body.scrollHeight, 400));
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(doc.body);
    return observer;
  }, [syncStyles]);

  useEffect(() => {
    let observer: ResizeObserver | undefined;
    const frame = iframeRef.current;
    if (!frame) return;

    const onLoad = () => {
      observer?.disconnect();
      observer = attach();
    };

    // srcDoc iframes may already be ready by the time this effect runs.
    if (frame.contentDocument?.readyState === 'complete') onLoad();
    frame.addEventListener('load', onLoad);

    // In development Next.js injects new <style> tags on hot reload.
    const headObserver = new MutationObserver(() => {
      const doc = frame.contentDocument;
      if (doc) syncStyles(doc);
    });
    headObserver.observe(document.head, { childList: true });

    return () => {
      frame.removeEventListener('load', onLoad);
      headObserver.disconnect();
      observer?.disconnect();
    };
  }, [attach, syncStyles]);

  // Clicking the letterbox area around the frame clears the selection.
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !onBackgroundClick) return;
    const handler = (event: MouseEvent) => {
      if (event.target === doc.body) onBackgroundClick();
    };
    doc.addEventListener('click', handler);
    return () => doc.removeEventListener('click', handler);
  }, [mountNode, onBackgroundClick]);

  return (
    <div
      className={className}
      // transform: scale() leaves layout size untouched, so the wrapper carries
      // the scaled dimensions and the scroll area stays accurate.
      style={{ width: width * scale, height: contentHeight * scale }}
    >
      <iframe
        ref={iframeRef}
        title="Website canvas"
        srcDoc="<!DOCTYPE html><html><head><meta charset='utf-8'></head><body></body></html>"
        style={{
          width,
          height: contentHeight,
          border: 0,
          display: 'block',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      />
      {mountNode ? createPortal(children, mountNode) : null}
    </div>
  );
}
