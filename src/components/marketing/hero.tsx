import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from './shell';
import { HeroSites } from './hero-sites';

/**
 * The hero.
 *
 * Type on the left, generated websites on the right. It opened on a photograph
 * of a laptop, which was atmospheric and said nothing - the product turns a
 * sentence into a website, so what belongs above the fold is the websites.
 *
 * Three of them, stacked, rather than one: different palettes, typefaces and
 * photography side by side show range, which a single screenshot cannot - and
 * range is the actual claim being made.
 *
 * They are rendered, not photographed. A picture of output would be
 * indistinguishable from art direction; this is the generator's own work, so it
 * cannot promise more than the product delivers.
 */

const TRUST = ['No credit card', 'Your Vercel account', 'Plain HTML', 'No lock-in'];

export function Hero({ signedIn }: { signedIn: boolean }) {
  // Pulled up under the sticky bar, which takes layout space rather than
  // floating. Without this the dark section starts below it and the page opens
  // on a white strip with an inverted logo invisible inside it.
  return (
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
            {/*
              The category line lives inside the h1 rather than in a paragraph
              above it. Pixel-identical, and it means the page's one heading
              says what the product is: "Build Smarter. Launch Faster." is a
              good line on a page and an empty one in a result list, matchable
              only by the brand - the query that needs the least help.
            */}
            <h1 className="text-white">
              <span className="block font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-white/45">
                AI website generator
              </span>
              <span className="mt-6 block text-balance text-[2.75rem] font-semibold leading-[0.95] tracking-[-0.045em] sm:text-[3.5rem] lg:text-[4rem]">
                Build Smarter.
                <br />
                Launch Faster.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-pretty text-[19px] font-medium leading-snug tracking-[-0.01em] text-white/85 sm:text-[21px]">
              Describe your website in one sentence and get a complete, production-ready site.
            </p>

            <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/55">
              Web Copilot generates structured multi-page websites, lets you edit them visually or through AI, and
              deploys the final site to your own Vercel account.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={signedIn ? '/dashboard' : '/signin?mode=register'}
                className="focus-ring group inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-white px-6 text-[15px] font-medium text-ink-950 transition-transform duration-200 hover:-translate-y-0.5 sm:w-auto"
              >
                {signedIn ? 'Open your dashboard' : 'Start building free'}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how-it-works"
                className="focus-ring inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg border border-white/20 bg-white/5 px-6 text-[15px] font-medium text-white backdrop-blur-sm transition-colors hover:border-white/35 hover:bg-white/10 sm:w-auto"
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

          {/* ------------------------------------------- what it produces */}
          {/* The cluster brings its own glow; it needs no wrapper but this. */}
          <div className="relative">
            <HeroSites />
          </div>
        </div>
      </Container>
    </section>
  );
}
