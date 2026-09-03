'use client';

import { useEffect } from 'react';

/**
 * Scroll reveal.
 *
 * A single IntersectionObserver marks elements as shown, and the transition
 * itself is CSS (see .reveal in globals.css). No animation library, no
 * per-element listeners, and nothing runs at all when the user has asked for
 * reduced motion.
 *
 * Elements opt in with `className="reveal"` and an optional inline
 * `transitionDelay` for staggering.
 */
export function RevealProvider() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

    if (reduced || !('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.setAttribute('data-shown', 'true'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-shown', 'true');
          observer.unobserve(entry.target);
        }
      },
      // Fire slightly before the element is fully in view, so the motion has
      // finished by the time the reader gets to it.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );

    nodes.forEach((node) => {
      // Anything already on screen at load should not animate in.
      if (node.getBoundingClientRect().top < window.innerHeight * 0.9) {
        node.setAttribute('data-shown', 'true');
        return;
      }
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
