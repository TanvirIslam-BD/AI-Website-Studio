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
          className="studio-grid absolute inset-0 opacity-[0.12]"
          style={{
            maskImage: 'radial-gradient(70% 60% at 30% 40%, black 5%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(70% 60% at 30% 40%, black 5%, transparent 75%)',
          }}
        />
        {/* Warm key light from the top left, behind the type. */}
        <div
          className="absolute -left-40 -top-40 h-[42rem] w-[42rem] rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgba(215,193,154,0.16), transparent 72%)' }}
        />
        {/* A cooler lift behind the websites, so the frames have something to sit on. */}
        <div
          className="absolute inset-y-0 right-0 w-2/3"
          style={{ background: 'radial-gradient(60% 60% at 70% 45%, rgba(255,255,255,0.09), transparent 70%)' }}
        />
        <div className="grain absolute inset-0 opacity-40" />
        {/* A champagne hairline where the hero ends. */}
        <div className="hairline-gold absolute inset-x-0 bottom-0" />
      </div>

      <Container className="relative pb-32 pt-36 sm:pb-44 sm:pt-44">
        <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12">
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
              <span className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.34em] text-gold-300">
                <span className="h-px w-10 bg-gold-300/50" aria-hidden />
                AI website generator
              </span>
              <span className="mt-8 block text-balance font-display text-[3.4rem] font-normal leading-[0.95] tracking-[-0.025em] sm:text-[4.6rem] lg:text-[5.4rem]">
                Build Smarter.
                <br />
                <em className="text-champagne pr-[0.08em] italic">Launch Faster.</em>
              </span>
            </h1>

            <p className="mt-9 max-w-xl text-pretty text-[19px] font-light leading-[1.5] tracking-[-0.005em] text-white/85 sm:text-[21px]">
              Describe your website in one sentence and get a complete, production-ready site.
            </p>

            <p className="mt-5 max-w-lg text-pretty text-[15px] leading-[1.75] text-white/50">
              Web Copilot generates structured multi-page websites, lets you edit them visually or through AI, and
              deploys the final site to your own Vercel account.
            </p>

            <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={signedIn ? '/dashboard' : '/signin?mode=register'}
                className="focus-ring group inline-flex h-[52px] w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-b from-white to-[#f1ece2] px-8 text-[15px] font-medium text-ink-950 shadow-[0_0_0_1px_rgba(215,193,154,0.45),0_18px_40px_-18px_rgba(215,193,154,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(215,193,154,0.7),0_22px_48px_-18px_rgba(215,193,154,0.75)] sm:w-auto"
              >
                {signedIn ? 'Open your dashboard' : 'Start building free'}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#how-it-works"
                className="focus-ring inline-flex h-[52px] w-full items-center justify-center whitespace-nowrap rounded-full border border-white/15 bg-white/[0.03] px-8 text-[15px] font-medium text-white/90 backdrop-blur-sm transition-colors duration-300 hover:border-gold-300/50 hover:text-white sm:w-auto"
              >
                See how it works
              </a>
            </div>

            <ul className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-2.5 border-t border-white/[0.08] pt-7">
              {TRUST.map((item) => (
                <li key={item} className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-white/45">
                  <span className="h-1 w-1 rotate-45 bg-gold-300/70" aria-hidden />
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
