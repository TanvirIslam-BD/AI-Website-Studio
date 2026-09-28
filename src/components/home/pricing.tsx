import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Band, Container, Heading } from './primitives';

/**
 * Tiers mirror the WorkspacePlan enum in the schema (FREE / PRO / AGENCY).
 *
 * Billing is not implemented yet, so only the free tier links to sign-up and
 * the paid tiers say so plainly rather than implying a checkout.
 */
const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything you need to build and ship your first site.',
    features: [
      '1 website',
      'Unlimited pages and sections',
      'Full visual editor with undo/redo',
      'AI generation and copilot edits',
      'Deploy to your own Vercel account',
    ],
    available: true,
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'For freelancers and small businesses running several sites.',
    features: ['Unlimited websites', 'Custom domains', 'Unsplash image search', 'Revision history and rollback', 'Priority AI models'],
    available: false,
    highlighted: true,
  },
  {
    name: 'Agency',
    price: '$79',
    period: 'per month',
    description: 'For teams delivering websites for clients.',
    features: ['Everything in Pro', 'Team workspaces and roles', 'Client handover', 'White-labelled editor', 'Shared brand kit templates'],
    available: false,
    highlighted: false,
  },
];

export function Pricing({ signedIn }: { signedIn: boolean }) {
  return (
    <Band id="pricing">
      <Container>
        <Heading
          kicker="Pricing"
          title="Start free. Stay free for as long as it fits."
          lede="The free plan is the complete product, not a trial. Paid plans add scale when you need it."
        />

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={cn(
                'reveal relative flex flex-col rounded-3xl p-8',
                plan.highlighted ? 'glass-lit' : 'glass',
              )}
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-medium text-white">{plan.name}</h3>
                {plan.highlighted ? (
                  <span className="rounded-full bg-gradient-to-r from-indigo-300 to-sky-300 px-2.5 py-0.5 text-[11px] font-semibold text-[#07070a]">
                    Most popular
                  </span>
                ) : null}
              </div>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="text-[3.25rem] font-semibold leading-none tracking-[-0.05em] text-white">{plan.price}</span>
                <span className="text-[13px] text-white/40">{plan.period}</span>
              </p>
              <p className="mt-4 min-h-[44px] text-[14px] leading-relaxed text-white/50">{plan.description}</p>

              <ul className="mt-7 flex-1 space-y-3 border-t border-white/[0.08] pt-7">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-[14px] text-white/70">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-300/90" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.available ? (
                <Link
                  href={signedIn ? '/dashboard' : '/signin?mode=register'}
                  className="focus-ring mt-9 inline-flex h-11 items-center justify-center rounded-xl bg-white text-[14px] font-medium text-[#07070a] transition-colors hover:bg-white/90"
                >
                  {signedIn ? 'Open your dashboard' : 'Start free'}
                </Link>
              ) : (
                <span className="mt-9 inline-flex h-11 cursor-default items-center justify-center rounded-xl border border-white/10 text-[14px] text-white/45">
                  Coming soon
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-[13px] text-white/40">
          Paid plans are not billed yet. Everything under Free is available today, and nothing is charged unless you
          choose to upgrade.
        </p>
      </Container>
    </Band>
  );
}
