/**
 * Vercel's triangle.
 *
 * Shared rather than redrawn per use: it appears on the connect button in the
 * editor and on the marketing page, and two copies of a path drift.
 *
 * Used to identify the hosting provider this product genuinely integrates
 * with - naming and marking a service to say "we work with this" - and drawn
 * in `currentColor` so it inherits whatever surface it sits on rather than
 * being restyled.
 */
export function VercelMark({ className = 'h-3 w-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 76 65" aria-hidden className={className} fill="currentColor">
      <path d="M37.53 0 75.06 65H0z" />
    </svg>
  );
}
