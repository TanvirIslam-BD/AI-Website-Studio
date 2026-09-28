import { Check } from 'lucide-react';
import { VercelMark } from '@/components/brand/vercel-mark';
import { PromptStarter } from '@/app/prompt-starter';
import { Container, Screenshot } from './primitives';

/**
 * The hero.
 *
 * The prompt box is the call to action, because it *is* the product's entry
 * point: whatever is typed survives sign-up and generation starts from it. The
 * real editor sits underneath at full width, so the first scroll answers "what
 * would I be using?" with the thing itself rather than an illustration.
 */
export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative isolate overflow-hidden pt-36 sm:pt-44">
      {/* Atmosphere: an aurora from above and a fine grid fading out below it. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="aurora absolute left-1/2 top-[-18rem] h-[44rem] w-[70rem] -translate-x-1/2" />
        <div
          className="home-grid absolute inset-0"
          style={{
            maskImage: 'radial-gradient(60% 50% at 50% 20%, black, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(60% 50% at 50% 20%, black, transparent 75%)',
          }}
        />
      </div>

      <Container className="text-center">
        <p className="animate-rise mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3.5 text-[12px] text-white/65 backdrop-blur">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[#07070a]">
            <VercelMark className="h-2.5 w-2.5" />
          </span>
          Publishes to your own Vercel account
        </p>

        {/*
          The category stays inside the h1. It is the page's only top-level
          heading, and "AI website generator" is what people search for - the
          display line alone would only ever match the brand.
        */}
        <h1 className="animate-rise mx-auto mt-8 max-w-5xl [animation-delay:80ms]">
          <span className="block text-[12px] font-medium uppercase tracking-[0.28em] text-white/40">
            AI website generator
          </span>
          <span className="text-gradient mt-5 block text-balance text-[2.9rem] font-semibold leading-[0.98] tracking-[-0.05em] sm:text-[4.5rem] lg:text-[5.5rem]">
            Describe it once.
            <br />
            Launch a site that&rsquo;s yours.
          </span>
        </h1>

        <p className="animate-rise mx-auto mt-7 max-w-2xl text-pretty text-[17px] leading-relaxed text-white/55 [animation-delay:160ms] sm:text-[19px]">
          Write one sentence about your business. Web Copilot builds the whole website - pages, copy, imagery and a
          brand kit - lets you refine it by clicking or by asking, and publishes it as fast, plain HTML.
        </p>

        <div className="animate-rise relative mx-auto mt-10 max-w-2xl [animation-delay:240ms]">
          {/* A lit halo behind the one control that matters. */}
          <div
            className="absolute -inset-px rounded-2xl bg-gradient-to-r from-indigo-400/40 via-sky-300/30 to-fuchsia-400/30 opacity-70 blur-lg"
            aria-hidden
          />
          <div className="relative rounded-2xl bg-[#0b0b10] p-1.5 ring-1 ring-white/10">
            <PromptStarter signedIn={signedIn} tone="dark" />
          </div>
        </div>

        <ul className="animate-rise mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-white/45 [animation-delay:320ms]">
          {['Free to start', 'No credit card', 'Your hosting, your code'].map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-sky-300/80" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </Container>

      {/* ------------------------------------------------ the product itself */}
      <Container className="relative mt-20 sm:mt-24">
        <div id="product" className="relative scroll-mt-24">
          <div className="aurora-soft absolute inset-x-[8%] -top-10 bottom-10 -z-10 blur-3xl" aria-hidden />
          <div className="animate-rise relative rounded-[28px] border border-white/10 bg-white/[0.03] p-2 shadow-[0_40px_120px_-40px_rgba(99,102,241,0.45)] [animation-delay:400ms] sm:p-3">
            <Screenshot
              src="/product/02-editor-app.webp"
              alt="The Web Copilot editor: the section list, the live canvas and the AI copilot side by side."
              label="studio.web.copilotai.live"
              priority
            />
          </div>

          {/* Floating callouts: what the two halves of the editor actually do. */}
          <div className="absolute rounded-2xl border border-white/10 bg-[#0d0d12]/95 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)] ring-1 ring-black/40 backdrop-blur-xl -left-2 top-[18%] hidden w-64 p-4 text-left lg:block xl:-left-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">You ask</p>
            <p className="mt-2 rounded-xl bg-white px-3 py-2 text-[13px] font-medium text-[#07070a]">
              Make the hero darker and tighten the headline.
            </p>
            <p className="mt-3 flex items-center gap-2 font-mono text-[11px] text-sky-200/80">
              <Check className="h-3.5 w-3.5" aria-hidden /> update_section · hero
            </p>
          </div>
          <div className="absolute rounded-2xl border border-white/10 bg-[#0d0d12]/95 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)] ring-1 ring-black/40 backdrop-blur-xl -right-2 bottom-[14%] hidden w-60 p-4 text-left lg:block xl:-right-10">
            <p className="flex items-center gap-2 text-[12px] font-medium text-white">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live
            </p>
            <p className="mt-1.5 font-mono text-[12px] text-white/55">aperture-light.vercel.app</p>
            <p className="mt-3 text-[11px] text-white/35">Static HTML · 0 KB JavaScript</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
