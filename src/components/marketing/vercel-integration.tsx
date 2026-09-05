import Link from 'next/link';
import { ArrowUpRight, Check, KeyRound, Lock, MousePointerClick, Target } from 'lucide-react';
import { integrationConfig } from '@/lib/deploy/oauth';
import { VercelMark } from '@/components/brand/vercel-mark';
import { Container, Section, SectionHeading } from './shell';

/**
 * The Vercel integration, stated plainly.
 *
 * The deploy section below shows what a deployment *produces* - static HTML, no
 * runtime, the measured weight. It never explains where that ends up or whose
 * account pays for it, which is the first question anyone evaluating a website
 * builder asks: do I own the result, or is it parked on someone else's
 * platform. This section answers that before the pricing section is reached.
 *
 * Every claim here maps to something in the codebase: the OAuth connect flow
 * (lib/deploy/oauth.ts), per-project publishing targets
 * (Project.vercelProjectId), the verify-before-save in
 * `connectWorkspace`, and the encrypted per-workspace credential with
 * `disconnectWorkspace` beside it. Nothing is aspirational.
 */

const POINTS = [
  {
    icon: MousePointerClick,
    title: 'Connect by clicking',
    body: 'Approve it on Vercel and come back connected. No access token to generate, copy, or keep somewhere safe.',
  },
  {
    icon: Target,
    title: 'Choose where each site publishes',
    body: 'Point a website at an existing Vercel project, or let the first deployment create one for it.',
  },
  {
    icon: Check,
    title: 'Checked before it is saved',
    body: 'The connection is verified against Vercel as you make it, so a credential that cannot publish is refused there and then rather than at your first deploy.',
  },
  {
    icon: Lock,
    title: 'Encrypted, and yours to revoke',
    body: 'Stored encrypted at rest against your workspace alone, and disconnected from the same screen whenever you want.',
  },
];

export function VercelIntegration() {
  /**
   * The marketplace link appears only where an integration is actually
   * registered. A self-hosted copy has no listing to point at, and a dead link
   * on the marketing page is worse than no link.
   */
  const slug = integrationConfig()?.slug ?? null;

  return (
    <Section id="vercel" tone="dark">
      <Container>
        <SectionHeading
          dark
          eyebrow="Vercel integration"
          title="Your websites, on your own Vercel account."
          body="Connect your account once and everything this studio builds publishes into it - your project, your domain, your plan. Nothing is parked on our infrastructure, so nothing is ours to hold."
        />

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-14">
          <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-1 lg:gap-6">
            {POINTS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="reveal flex gap-3.5" style={{ transitionDelay: `${i * 60}ms` }}>
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/12 bg-white/[0.06]">
                  <Icon className="h-4 w-4 text-white" strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-white">{title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-400">{body}</p>
                </span>
              </li>
            ))}
          </ul>

          {/*
            The connect screen as it actually appears once an account is linked,
            rather than an illustration of one. It is the screen the four points
            describe, so showing it saves the reader assembling it themselves.
          */}
          <div className="reveal" style={{ transitionDelay: '120ms' }}>
            <div className="overflow-hidden rounded-xl border border-white/12 bg-ink-950 shadow-pop">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
                <span className="flex gap-1.5" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  ))}
                </span>
                <span className="ml-1 font-mono text-[10px] text-ink-500">hosting</span>
              </div>

              <div className="p-5">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                  Connected
                </p>

                <p className="mt-2.5 flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-white">
                  <VercelMark className="h-3.5 w-3.5" />
                  your-team
                </p>

                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                  Publishes to
                </p>
                <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2.5">
                  <span className="truncate font-mono text-[12px] text-white">aperture-light</span>
                  <span className="shrink-0 rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-ink-400">
                    project
                  </span>
                </div>

                <p className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-[12px] text-ink-400">
                  <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-950">
                    Live
                  </span>
                  <span className="truncate font-mono text-white">aperture-light.vercel.app</span>
                </p>
              </div>
            </div>

            <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-ink-500">
              <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
              Self-hosting the studio instead? Paste a Vercel token and everything above works the same.
            </p>
          </div>
        </div>

        {slug ? (
          <div className="reveal mt-12 flex justify-center">
            <Link
              href={`https://vercel.com/marketplace/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="focus-ring group inline-flex h-11 items-center gap-2 rounded-lg border border-white/15 px-5 text-[14px] font-medium text-white transition-colors hover:border-white/35"
            >
              <VercelMark className="h-3.5 w-3.5" />
              Find us on the Vercel Marketplace
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
