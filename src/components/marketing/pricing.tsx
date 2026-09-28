import Link from 'next/link';
import { Check } from 'lucide-react';
import { Container, Section, SectionHeading } from './shell';
import { cn } from '@/lib/utils';

/**
 * Tiers mirror the WorkspacePlan enum in the schema (FREE / PRO / AGENCY).
 *
 * Billing is not implemented yet, so only the free tier links to sign-up and
 * the paid tiers are labelled honestly rather than implying a checkout.
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
    cta: { label: 'Start free', href: '/signin?mode=register' },
    available: true,
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'For freelancers and small businesses running several sites.',
    features: [
      'Unlimited websites',
      'Custom domains',
      'Unsplash image search',
      'Revision history and rollback',
      'Priority AI models',
    ],
    cta: { label: 'Coming soon', href: '/signin?mode=register' },
    available: false,
    highlighted: true,
  },
  {
    name: 'Agency',
    price: '$79',
    period: 'per month',
    description: 'For teams delivering websites for clients.',
    features: [
      'Everything in Pro',
      'Team workspaces and roles',
      'Client handover',
      'White-labelled editor',
      'Shared brand kit templates',
    ],
    cta: { label: 'Coming soon', href: '/signin?mode=register' },
    available: false,
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <Section id="pricing">
      <Container>
        <SectionHeading
          eyebrow="Pricing"
          title="Start free, pay when it *pays for itself*"
          body="No credit card to begin, and the free tier is a complete product rather than a trial."
        />

        <div className="mt-20 grid items-stretch gap-6 lg:grid-cols-3 lg:items-center">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'reveal relative flex h-full flex-col overflow-hidden rounded-2xl border p-8 sm:p-9',
                plan.highlighted
                  ? 'border-ink-900 bg-ink-950 text-white shadow-luxe lg:-my-4 lg:py-12'
                  : 'border-[#ebe6dc] bg-white',
              )}
            >
              {plan.highlighted ? (
                <>
                  <div className="glow-warm absolute inset-0" aria-hidden />
                  <div className="hairline-gold absolute inset-x-0 top-0" aria-hidden />
                </>
              ) : null}

              <div className="relative flex items-center justify-between gap-3">
                <h3
                  className={cn(
                    'text-[11px] font-medium uppercase tracking-[0.28em]',
                    plan.highlighted ? 'text-gold-300' : 'text-gold-600',
                  )}
                >
                  {plan.name}
                </h3>
                {plan.highlighted ? (
                  <span className="rounded-full border border-gold-300/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-gold-200">
                    Most popular
                  </span>
                ) : null}
              </div>

              <p className="relative mt-7 flex items-baseline gap-2">
                <span
                  className={cn(
                    'font-display text-[3.75rem] font-normal leading-none tracking-[-0.02em]',
                    plan.highlighted ? 'text-white' : 'text-ink-950',
                  )}
                >
                  {plan.price}
                </span>
                <span className={cn('text-[13px]', plan.highlighted ? 'text-white/45' : 'text-ink-400')}>
                  {plan.period}
                </span>
              </p>
              <p
                className={cn(
                  'relative mt-4 min-h-[42px] text-[14px] leading-relaxed',
                  plan.highlighted ? 'text-white/60' : 'text-ink-500',
                )}
              >
                {plan.description}
              </p>

              <div className={cn('relative mt-7 h-px', plan.highlighted ? 'bg-white/10' : 'bg-[#ebe6dc]')} />

              <ul className="relative mt-7 flex-1 space-y-3.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={cn(
                      'flex items-start gap-3 text-[14px]',
                      plan.highlighted ? 'text-white/75' : 'text-ink-600',
                    )}
                  >
                    <Check
                      className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', plan.highlighted ? 'text-gold-300' : 'text-gold-500')}
                      strokeWidth={2.25}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.available ? (
                <Link
                  href={plan.cta.href}
                  className={cn(
                    'relative mt-10 inline-flex h-12 items-center justify-center rounded-full text-sm font-medium transition-colors duration-300',
                    plan.highlighted
                      ? 'bg-ink-950 text-white hover:bg-ink-800'
                      : 'border border-ink-950 bg-ink-950 text-white hover:bg-ink-800',
                  )}
                >
                  {plan.cta.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'relative mt-10 inline-flex h-12 cursor-default items-center justify-center gap-2 rounded-full border text-sm font-medium',
                    plan.highlighted ? 'border-white/15 text-white/55' : 'border-[#e3ddd1] text-ink-400',
                  )}
                >
                  {plan.cta.label}
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-[13px] text-ink-500">
          Paid plans are not billed yet - everything listed under Free is available today, and you will not be charged
          without choosing to upgrade.
        </p>
      </Container>
    </Section>
  );
}
