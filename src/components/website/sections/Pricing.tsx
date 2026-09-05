import { Check } from 'lucide-react';
import type { SectionOfType } from '@/lib/website/sections';
import { anchorId, Button, Container, Heading, Prose, SectionShell, resolveLink, type SectionViewProps } from '../primitives';
import { SectionHead } from './SectionHead';

export function PricingSection({ section, theme, hrefFor, decorative }: SectionViewProps<SectionOfType<'pricing'>>) {
  return (
    <SectionShell background={section.background} paddingY={section.paddingY} id={anchorId('pricing', decorative)}>
      <Container wide>
        <SectionHead decorative={decorative} eyebrow={section.eyebrow} heading={section.heading} subheading={section.subheading} />
        <div
          className="mt-14 grid grid-cols-1 items-start md:grid-cols-2 lg:grid-cols-3"
          style={{ gap: 'var(--ws-gap)' }}
        >
          {section.plans.map((plan, i) => (
            <div
              key={i}
              className="flex h-full flex-col p-8"
              style={{
                background: plan.highlighted ? 'var(--ws-primary-soft)' : 'var(--ws-bg)',
                border: `1px solid ${plan.highlighted ? 'var(--ws-primary)' : 'var(--sec-border)'}`,
                borderRadius: 'var(--ws-radius-lg)',
                color: 'var(--ws-text)',
              }}
            >
              {plan.highlighted ? (
                <span
                  className="mb-4 inline-flex w-fit px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em]"
                  style={{ background: 'var(--ws-primary)', color: 'var(--ws-primary-fg)', borderRadius: 'var(--ws-radius-sm)' }}
                >
                  Most popular
                </span>
              ) : null}
              <Heading level={3} decorative={decorative}>{plan.name}</Heading>
              {plan.description ? (
                <Prose size="sm" className="mt-2">
                  {plan.description}
                </Prose>
              ) : null}
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-[-0.03em]" style={{ fontFamily: 'var(--ws-font-heading)' }}>
                  {plan.price}
                </span>
                {plan.period ? <span className="text-sm" style={{ opacity: 0.6 }}>/{plan.period}</span> : null}
              </div>
              <ul className="mt-7 flex-1 space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm" style={{ fontFamily: 'var(--ws-font-body)' }}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} style={{ color: 'var(--ws-primary)' }} />
                    <span style={{ opacity: 0.82 }}>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button link={resolveLink(plan.cta, hrefFor)} theme={theme} size="lg" tone={plan.highlighted ? 'primary' : 'secondary'} />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </SectionShell>
  );
}
