import { Plus } from 'lucide-react';
import type { SectionOfType } from '@/lib/website/sections';
import { anchorId, Container, Heading, Prose, SectionShell, type SectionViewProps } from '../primitives';
import { SectionHead } from './SectionHead';

/**
 * Uses native <details>/<summary> so the accordion works with zero JavaScript.
 * That matters for the static export, which ships no runtime.
 */
export function FaqSection({ section, decorative }: SectionViewProps<SectionOfType<'faq'>>) {
  if (section.variant === 'twoColumn') {
    return (
      <SectionShell background={section.background} paddingY={section.paddingY} id={anchorId('faq', decorative)}>
        <Container>
          <SectionHead eyebrow={section.eyebrow} heading={section.heading} subheading={section.subheading} align="left" />
          <div className="mt-12 grid gap-x-12 gap-y-9 md:grid-cols-2">
            {section.items.map((item, i) => (
              <div key={i}>
                <Heading level={4}>{item.question}</Heading>
                <Prose size="sm" className="mt-2">
                  {item.answer}
                </Prose>
              </div>
            ))}
          </div>
        </Container>
      </SectionShell>
    );
  }

  return (
    <SectionShell background={section.background} paddingY={section.paddingY} id={anchorId('faq', decorative)}>
      <Container>
        <SectionHead eyebrow={section.eyebrow} heading={section.heading} subheading={section.subheading} />
        <div className="mx-auto mt-12 max-w-3xl">
          {section.items.map((item, i) => (
            <details
              key={i}
              className="group border-b"
              style={{ borderColor: 'var(--sec-border)' }}
            >
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[17px] font-semibold [&::-webkit-details-marker]:hidden"
                style={{ fontFamily: 'var(--ws-font-heading)' }}
              >
                {item.question}
                <Plus
                  className="h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-45"
                  style={{ color: 'var(--ws-primary)' }}
                />
              </summary>
              <div className="pb-5 pr-10">
                <Prose size="sm">{item.answer}</Prose>
              </div>
            </details>
          ))}
        </div>
      </Container>
    </SectionShell>
  );
}
