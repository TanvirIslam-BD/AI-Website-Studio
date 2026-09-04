import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from './shell';
import { HeroPipeline } from './hero-pipeline';

/**
 * The hero.
 *
 * A dark, photographic opening that hands over to the product on white. The
 * order still puts understanding first - eyebrow, two-line headline, one
 * sentence of substance, the actions - but it now reads as a cover rather than
 * a page heading, and the workflow panels below break the fold deliberately so
 * the real UI is the first thing on the light surface.
 *
 * The photograph is a laptop lit by its own screen. It was chosen over the
 * abstract gradients in the same collection because those are saturated in
 * hues the identity does not have, and would fight a monochrome palette; this
 * one is almost entirely black, so the colour that survives is a rim of light
 * around the subject. That, rather than an accent hue, is where the warmth in
 * this section comes from.
 */

/**
 * Unsplash, served through their CDN with the same transform parameters as the
 * product's own stock collection. Sized for a wide hero and left uncropped
 * vertically so the subject keeps its space on tall viewports.
 */
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=2400&q=85';

const TRUST = ['No credit card', 'Your Vercel account', 'Plain HTML', 'No lock-in'];

export function Hero({ providerLabel, signedIn }: { providerLabel: string | null; signedIn: boolean }) {
  return (
    <>
      {/*
        Pulled up under the sticky bar, which takes layout space rather than
        floating. Without this the dark section starts below it and the page
        opens on a white strip with an inverted logo invisible inside it. The
        top padding puts the same distance back.
      */}
      <section className="relative isolate -mt-16 overflow-hidden bg-ink-950">
        {/* --- the photograph and everything that makes type legible on it --- */}
        <div className="absolute inset-0 -z-10" aria-hidden>
          {/*
            Deliberately a plain <img>, matching the rest of the product: the
            marketing page ships no next/image dependency. Eager and
            high-priority because this is the largest paint on the page.
          */}
          <img
            src={HERO_IMAGE}
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full scale-105 object-cover object-center opacity-[0.95] saturate-[0.95] sm:object-[70%_center]"
          />

          {/*
            Three scrims, each doing one job. Left-to-right so the headline sits
            on near-solid black however the photo crops; top-down so the nav has
            a surface; bottom-up so the section resolves into the white below
            instead of ending on a hard edge.
          */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/20 sm:via-ink-950/60 sm:to-transparent" />
          {/* Holds the left column solid enough for body copy at any crop. */}
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-ink-950 to-transparent sm:w-[62%]" />
          {/*
            Narrow screens have no empty column to put type in - the copy sits
            over the lit part of the screen - so they get a flat wash as well.
            Wide screens do not need it and are better without it.
          */}
          <div className="absolute inset-0 bg-ink-950/45 sm:hidden" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink-950/90 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink-950 to-transparent" />

          {/* Grain, so the large dark gradients cannot band on a wide screen. */}
          <div className="grain absolute inset-0 opacity-[0.5]" />
        </div>

        <Container className="relative pb-40 pt-36 sm:pb-48 sm:pt-44">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-white/45">
              AI website builder
            </p>

            <h1 className="mt-6 text-balance text-[2.75rem] font-semibold leading-[0.95] tracking-[-0.045em] text-white sm:text-[4rem] lg:text-[4.75rem]">
              Build Smarter.
              <br />
              Launch Faster.
            </h1>

            <p className="mt-7 max-w-xl text-pretty text-[19px] font-medium leading-snug tracking-[-0.01em] text-white/85 sm:text-[22px]">
              Turn one sentence into a complete, production-ready website.
            </p>

            <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/55">
              Web Copilot generates structured multi-page websites, lets you edit them visually or through AI, and
              deploys the final site to your own Vercel account.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={signedIn ? '/dashboard' : '/signin?mode=register'}
                className="focus-ring group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-white px-7 text-[15px] font-medium text-ink-950 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white sm:w-auto"
              >
                {signedIn ? 'Open your dashboard' : 'Start building free'}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how-it-works"
                className="focus-ring inline-flex h-12 w-full items-center justify-center rounded-lg border border-white/20 bg-white/5 px-7 text-[15px] font-medium text-white backdrop-blur-sm transition-colors hover:border-white/35 hover:bg-white/10 sm:w-auto"
              >
                See how it works
              </a>
            </div>

            <ul className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2">
              {TRUST.map((item) => (
                <li key={item} className="flex items-center gap-2 text-[12px] text-white/50">
                  <span className="h-1 w-1 rounded-full bg-white/35" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/*
        The product, breaking the fold. Pulled up over the boundary so the first
        thing on the white surface is real UI rather than another heading - the
        page argues for the product only after showing it.
      */}
      <div className="relative bg-white pb-20 sm:pb-24">
        <Container>
          <div className="reveal -mt-28 sm:-mt-36">
            <HeroPipeline />
          </div>
          <p className="mt-7 text-center text-[12px] text-ink-400">
            {providerLabel
              ? `Generation runs on ${providerLabel}. Deployment goes to your own Vercel project.`
              : 'Runs on built-in templates until you add an AI key. Deployment goes to your own Vercel project.'}
          </p>
        </Container>
      </div>
    </>
  );
}
