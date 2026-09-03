/**
 * Hero atmosphere.
 *
 * Stacked back to front: a warm-white base, an off-canvas light source at the
 * top, four drifting aurora blobs kept to the flanks, a soft lift behind the
 * type, a radially masked grid, grain, and a fade out to white.
 *
 * All CSS: no images, no JavaScript, nothing that can shift layout. The whole
 * thing is inside `overflow-hidden` so the oversized blobs cannot widen the
 * document - an earlier version of this did exactly that on mobile.
 */
export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[860px] overflow-hidden" aria-hidden>
      {/* Base: never pure white, so the arc has something to sit on. */}
      <div className="absolute inset-0 bg-[#fbfbfe]" />

      {/*
        A luminous arc just above the fold. Soft washes alone read as vague;
        one defined edge gives the eye something to land on and makes the whole
        band feel deliberate rather than blurry.
      */}
      <div
        className="absolute left-1/2 -top-[430px] h-[700px] w-[1500px] -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            'radial-gradient(closest-side, rgba(255,255,255,0) 74%, rgba(129,140,248,0.62) 90%, rgba(165,180,252,0.12) 97%, rgba(255,255,255,0) 100%)',
          filter: 'blur(14px)',
        }}
      />

      {/* A light source just off the top edge, which anchors the whole wash */}
      <div
        className="absolute inset-x-0 -top-40 h-[620px]"
        style={{ background: 'radial-gradient(50% 62% at 50% 0%, rgba(99,102,241,0.36), rgba(99,102,241,0) 70%)' }}
      />

      {/* Aurora, kept to the flanks so the headline sits over clean paper. */}
      <div
        className="aurora-a absolute -left-[14%] -top-[16%] h-[660px] w-[660px] rounded-full opacity-80 blur-3xl will-change-transform"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(79,70,229,0.46), rgba(79,70,229,0) 66%)' }}
      />
      <div
        className="aurora-b absolute -right-[14%] -top-[12%] h-[620px] w-[620px] rounded-full opacity-75 blur-3xl will-change-transform"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(14,165,233,0.38), rgba(14,165,233,0) 66%)' }}
      />
      <div
        className="aurora-c absolute -left-[6%] top-[46%] h-[560px] w-[560px] rounded-full opacity-60 blur-3xl will-change-transform"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.34), rgba(139,92,246,0) 68%)' }}
      />
      <div
        className="aurora-b absolute -right-[8%] top-[40%] h-[520px] w-[520px] rounded-full opacity-50 blur-3xl will-change-transform"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.28), rgba(99,102,241,0) 70%)' }}
      />

      {/* A soft lift directly behind the type, so the headline stays crisp
          without bleaching the colour out of the whole band. */}
      <div
        className="absolute inset-x-0 top-16 h-[420px]"
        style={{ background: 'radial-gradient(40% 62% at 50% 30%, rgba(255,255,255,0.78), rgba(255,255,255,0) 74%)' }}
      />

      {/* Grid, masked so it dissolves instead of stopping at an edge. */}
      <div
        className="studio-grid absolute inset-0 opacity-[0.75]"
        style={{
          maskImage: 'radial-gradient(80% 58% at 50% 16%, black 12%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(80% 58% at 50% 16%, black 12%, transparent 80%)',
        }}
      />

      {/* Grain. */}
      <div className="grain absolute inset-0" />

      {/* Hand-off to the section below. */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
}
