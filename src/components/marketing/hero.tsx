import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from './shell';
import { HeroBackground } from './hero-background';
import { HeroPipeline } from './hero-pipeline';

/**
 * The hero.
 *
 * Ordered so a visitor understands the product before reading any body copy:
 * eyebrow, a two-line headline, one sentence of substance, the actions, then
 * the workflow rendered as real UI. The type is deliberately restrained in
 * height so the product visual is above the fold on a laptop.
 */

const TRUST = ['No credit card', 'Your Vercel account', 'Plain HTML', 'No lock-in'];

export function Hero({ providerLabel, signedIn }: { providerLabel: string | null; signedIn: boolean }) {
  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackground />

      <Container className="relative pb-20 pt-14 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-ink-500">
            AI website builder
          </p>

          <h1 className="mt-5 text-balance text-[2.5rem] font-semibold leading-[0.98] tracking-[-0.045em] text-ink-950 sm:text-[3.75rem] lg:text-[4.5rem]">
            Build Smarter.
            <br />
            Launch Faster.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-[19px] font-medium leading-snug tracking-[-0.01em] text-ink-800 sm:text-[21px]">
            Turn one sentence into a complete, production-ready website.
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-ink-500">
            Web Copilot generates structured multi-page websites, lets you edit them visually or through AI, and
            deploys the final site to your own Vercel account.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={signedIn ? '/dashboard' : '/signin?mode=register'}
              className="focus-ring group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink-950 px-7 text-[15px] font-medium text-white transition-colors hover:bg-ink-800 sm:w-auto"
            >
              {signedIn ? 'Open your dashboard' : 'Start building free'}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="focus-ring inline-flex h-12 w-full items-center justify-center rounded-lg border border-ink-200 bg-white px-7 text-[15px] font-medium text-ink-800 transition-colors hover:border-ink-300 hover:bg-ink-50 sm:w-auto"
            >
              See how it works
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {TRUST.map((item) => (
              <li key={item} className="flex items-center gap-2 text-[12px] text-ink-500">
                <span className="h-1 w-1 rounded-full bg-ink-400" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal mt-16 sm:mt-20">
          <HeroPipeline />
          <p className="mt-6 text-center text-[12px] text-ink-400">
            {providerLabel
              ? `Generation runs on ${providerLabel}. Deployment goes to your own Vercel project.`
              : 'Runs on built-in templates until you add an AI key. Deployment goes to your own Vercel project.'}
          </p>
        </div>
      </Container>
    </section>
  );
}
