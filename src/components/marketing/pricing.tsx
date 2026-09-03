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
          title="Start free, pay when it pays for itself"
          body="No credit card to begin, and the free tier is a complete product rather than a trial."
        />

        <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex h-full flex-col rounded-2xl border p-7',
                plan.highlighted ? 'border-brand-300 bg-brand-50/40 shadow-panel' : 'border-ink-200 bg-white',
              )}
            >
              {plan.highlighted ? (
                <span className="absolute -top-3 left-7 rounded-full bg-brand-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Most popular
                </span>
              ) : null}

              <h3 className="text-[15px] font-semibold text-ink-900">{plan.name}</h3>
              <p className="mt-1.5 min-h-[38px] text-[13px] leading-relaxed text-ink-500">{plan.description}</p>

              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-[-0.03em] text-ink-950">{plan.price}</span>
                <span className="text-[13px] text-ink-400">{plan.period}</span>
              </p>

              <ul className="mt-7 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[13px] text-ink-600">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" strokeWidth={2.5} />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.available ? (
                <Link
                  href={plan.cta.href}
                  className={cn(
                    'mt-8 inline-flex h-11 items-center justify-center rounded-lg text-sm font-semibold transition-colors',
                    plan.highlighted ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-ink-900 text-white hover:bg-ink-800',
                  )}
                >
                  {plan.cta.label}
                </Link>
              ) : (
                <span className="mt-8 inline-flex h-11 cursor-default items-center justify-center rounded-lg border border-ink-200 bg-white text-sm font-semibold text-ink-400">
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
