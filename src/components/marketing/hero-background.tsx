/**
 * Hero atmosphere.
 *
 * Deliberately quiet. The identity has no accent hue and the product UI is
 * meant to be the hero visual, so the background's job is to give the page
 * depth and recede - not to compete. Four layers: an off-white base, a fine
 * grid that dissolves radially, grain so the wash does not band, and a soft
 * top vignette reading as light falling from above.
 *
 * Pure CSS: no images, no JavaScript, nothing that can shift layout. Wrapped in
 * overflow-hidden so nothing here can widen the document.
 */
export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[880px] overflow-hidden" aria-hidden>
      {/* Never pure white, so borders and the grid have something to sit on. */}
      <div className="absolute inset-0 bg-[#fafafa]" />

      <div
        className="studio-grid absolute inset-0 opacity-90"
        style={{
          maskImage: 'radial-gradient(88% 62% at 50% 6%, black 8%, transparent 82%)',
          WebkitMaskImage: 'radial-gradient(88% 62% at 50% 6%, black 8%, transparent 82%)',
        }}
      />

      {/* Light from above: a wide, very soft lift behind the headline. */}
      <div
        className="absolute inset-x-0 -top-32 h-[560px]"
        style={{ background: 'radial-gradient(46% 58% at 50% 0%, rgba(255,255,255,0.95), rgba(255,255,255,0) 72%)' }}
      />

      {/* A whisper of shading at the outer edges, to round the band off. */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 70% at 50% 0%, rgba(10,10,10,0) 55%, rgba(10,10,10,0.045) 100%)' }}
      />

      <div className="grain absolute inset-0" />

      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
}
