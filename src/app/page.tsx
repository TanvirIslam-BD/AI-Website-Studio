import Link from 'next/link';
import { ArrowRight, Layers, MousePointerClick, Rocket, Sparkles, Wand2 } from 'lucide-react';
import { currentUser } from '@/lib/tenancy';
import { aiStatus } from '@/lib/ai';
import { isVercelConfigured } from '@/lib/deploy/vercel';
import { Logo } from '@/components/ui/misc';
import { PromptStarter } from './prompt-starter';

const STEPS = [
  { icon: Wand2, title: 'Describe it', body: 'One sentence about the business. The AI plans the pages, sections, copy and brand kit.' },
  { icon: MousePointerClick, title: 'Edit visually', body: 'Click any section to rewrite text, swap images, reorder or restyle. Undo everything.' },
  { icon: Sparkles, title: 'Ask the copilot', body: 'Say "make this more premium" and it edits the selected section, not the whole site.' },
  { icon: Rocket, title: 'Deploy', body: 'One click ships a static site to Vercel and hands you the production URL.' },
];

export default async function LandingPage() {
  const user = await currentUser();
  const ai = aiStatus();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-2 text-sm">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink-900 px-4 font-medium text-white transition-colors hover:bg-ink-800"
              >
                Open dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link href="/signin" className="rounded-lg px-3 py-2 font-medium text-ink-600 hover:text-ink-900">
                  Sign in
                </Link>
                <Link
                  href="/signin?mode=register"
                  className="inline-flex h-9 items-center rounded-lg bg-ink-900 px-4 font-medium text-white transition-colors hover:bg-ink-800"
                >
                  Start building
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-ink-200/70">
          <div className="studio-grid absolute inset-0 opacity-60" aria-hidden />
          <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-50/70 to-transparent" aria-hidden />
          <div className="relative mx-auto max-w-3xl px-6 pb-20 pt-20 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-600">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              {ai.configured
                ? `Running on ${ai.model} via ${ai.label}`
                : 'Running on built-in templates - add an API key for AI'}
            </span>
            <h1 className="mt-6 text-balance text-5xl font-bold leading-[1.05] tracking-[-0.035em] text-ink-950 sm:text-6xl">
              From a sentence to a<span className="text-brand-600"> deployed website</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-ink-500">
              Describe your business. Get a structured, editable, multi-page site, then refine it visually and ship it
              to Vercel.
            </p>
            <div className="mx-auto mt-9 max-w-xl">
              <PromptStarter signedIn={Boolean(user)} />
            </div>
            <p className="mt-4 text-xs text-ink-400">
              {isVercelConfigured()
                ? 'Vercel deployment is configured.'
                : 'Add VERCEL_TOKEN to enable one-click deployment.'}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <div key={step.title}>
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-900 text-white">
                    <step.icon className="h-4 w-4" strokeWidth={1.9} />
                  </span>
                  <span className="font-mono text-xs text-ink-400">0{index + 1}</span>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-ink-900">{step.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">{step.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-200/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-ink-400 sm:flex-row">
          <span className="inline-flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> AI Website Studio
          </span>
          <span>Next.js · Prisma · Auth.js · Vercel API</span>
        </div>
      </footer>
    </div>
  );
}
