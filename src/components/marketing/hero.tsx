import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from './shell';
import { HeroPipeline } from './hero-pipeline';

/**
 * The hero.
 *
 * Type on the left, the actual editor on the right. It opened on a photograph
 * of a laptop, which was atmospheric and said nothing - the product builds
 * websites, and the strongest thing available to put above the fold is the
 * thing doing the building.
 *
 * That change forces the layout. A screenshot of a light interface cannot sit
 * full-bleed behind white text, so the picture moves out of the background and
 * into a column of its own, and the dark ground becomes a backdrop rather than
 * an image. The frame is deliberately allowed to run off the right edge: it
 * reads as a window onto something larger, and it buys the type a full column
 * on the left rather than half a screen.
 */

/**
 * The editor, cropped out of the framed capture in `02-editor.webp`.
 *
 * That file is a marketing frame - the interface sitting under a caption and a
 * logo - which is right for a gallery and wrong here: the caption would land
 * directly under the h1 as a second, competing headline, and the logo would be
 * the page's third. This is the interface on its own.
 */
const HERO_SHOT = {
  src: '/product/02-editor-app.webp',
  alt: 'The Web Copilot editor: a generated photography site on the canvas, with the section list on the left and the AI copilot on the right.',
};

const TRUST = ['No credit card', 'Your Vercel account', 'Plain HTML', 'No lock-in'];

export function Hero({ providerLabel, signedIn }: { providerLabel: string | null; signedIn: boolean }) {
  return (
    <>
      {/*
        Pulled up under the sticky bar, which takes layout space rather than
        floating. Without this the dark section starts below it and the page
        opens on a white strip with an inverted logo invisible inside it.
      */}
      <section className="relative isolate -mt-16 overflow-hidden bg-ink-950">
        {/* Atmosphere only, now that the photograph is gone from behind. */}
        <div className="absolute inset-0 -z-10" aria-hidden>
          <div
            className="studio-grid absolute inset-0 opacity-[0.18]"
            style={{
              maskImage: 'radial-gradient(70% 60% at 30% 40%, black 5%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(70% 60% at 30% 40%, black 5%, transparent 75%)',
            }}
          />
          {/* A cool lift behind the screenshot, so the frame has something to sit on. */}
          <div
            className="absolute inset-y-0 right-0 w-2/3"
            style={{ background: 'radial-gradient(60% 60% at 70% 45%, rgba(255,255,255,0.10), transparent 70%)' }}
          />
          <div className="grain absolute inset-0 opacity-40" />
        </div>

        <Container className="relative pb-32 pt-32 sm:pb-40 sm:pt-40">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-10">
            {/* ------------------------------------------------------- type */}
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-white/45">
                AI website builder
              </p>

              <h1 className="mt-6 text-balance text-[2.75rem] font-semibold leading-[0.95] tracking-[-0.045em] text-white sm:text-[3.5rem] lg:text-[4rem]">
                Build Smarter.
                <br />
                Launch Faster.
              </h1>

              <p className="mt-7 max-w-xl text-pretty text-[19px] font-medium leading-snug tracking-[-0.01em] text-white/85 sm:text-[21px]">
                Turn one sentence into a complete, production-ready website.
              </p>

              <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/55">
                Web Copilot generates structured multi-page websites, lets you edit them visually or through AI, and
                deploys the final site to your own Vercel account.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={signedIn ? '/dashboard' : '/signin?mode=register'}
                  className="focus-ring group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-white px-7 text-[15px] font-medium text-ink-950 transition-transform duration-200 hover:-translate-y-0.5 sm:w-auto"
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

            {/* --------------------------------------------------- the editor */}
            {/*
              Wider than its column so the frame genuinely runs off the right
              edge rather than stopping just short of it - a negative margin
              sized in pixels only lands correctly at one viewport width. The
              section clips it, so nothing here can widen the document.
            */}
            <div className="relative lg:w-[126%] lg:max-w-none xl:w-[132%]">
              {/* Glow, so the frame lifts off the dark rather than sitting on it. */}
              <div
                className="absolute -inset-6 rounded-[2rem] opacity-70 blur-2xl"
                style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.16), transparent 70%)' }}
                aria-hidden
              />

              {/*
                No browser chrome around it: the capture already includes the
                editor's own toolbar, and a second frame on top of a real one
                reads as a picture of a picture.
              */}
              <figure className="relative overflow-hidden rounded-xl border border-white/12 bg-ink-900 shadow-pop">
                {/*
                  The largest paint on the page now, so it loads eagerly and at
                  high priority. Width and height are the file's real dimensions
                  so the box is reserved before it arrives.
                */}
                <img
                  src={HERO_SHOT.src}
                  alt={HERO_SHOT.alt}
                  width={1167}
                  height={657}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="block w-full"
                />
              </figure>
            </div>
          </div>
        </Container>
      </section>

      {/*
        The workflow, breaking the fold. The hero now shows where the editing
        happens; this shows how a site gets there in the first place.
      */}
      <div className="relative bg-white pb-20 sm:pb-24">
        <Container>
          <div className="reveal -mt-16 sm:-mt-20">
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
