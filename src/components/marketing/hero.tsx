import { Check, Sparkles } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { PromptStarter } from '@/app/prompt-starter';
import { Container } from './shell';
import { SiteShowcase } from './site-showcase';

const PROOF = ['No credit card', 'Deploys to your own Vercel account', 'Your site, plain HTML, no lock-in'];

export function Hero({ providerLabel, signedIn }: { providerLabel: string | null; signedIn: boolean }) {
  return (
    <section className="relative overflow-hidden">
      {/* Layered background: soft brand wash, then a grid that fades out. */}
      <div className="absolute inset-x-0 top-0 h-[620px] bg-gradient-to-b from-brand-50 via-brand-50/30 to-transparent" aria-hidden />
      <div
        className="studio-grid absolute inset-x-0 top-0 h-[620px] opacity-[0.55] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        aria-hidden
      />

      <Container className="relative pb-16 pt-16 sm:pb-24 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-ink-600 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            {providerLabel ? `Powered by ${providerLabel}` : 'Works offline with built-in templates'}
          </span>

          <h1 className="mt-7 text-balance text-[2.75rem] font-bold leading-[1.03] tracking-[-0.04em] text-ink-950 sm:text-6xl lg:text-[4.25rem]">
            From a sentence to a{' '}
            <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              deployed website
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-500 sm:text-xl">
            {BRAND.shortName} generates a structured, multi-page site from one line of description. Edit it visually,
            direct it by chat, then ship it live.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl">
          <PromptStarter signedIn={signedIn} />
        </div>

        <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {PROOF.map((item) => (
            <li key={item} className="inline-flex items-center gap-1.5 text-[13px] text-ink-500">
              <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-16 sm:mt-20">
          <SiteShowcase />
          <p className="mt-4 text-center text-[12px] text-ink-400">
            An actual generated site - rendered by the same components that build the deployed version.
          </p>
        </div>
      </Container>
    </section>
  );
}
