import type { SectionOfType } from '@/lib/website/sections';
import { Card, Container, SectionShell, type SectionViewProps } from '../primitives';
import { SectionHead } from './SectionHead';

export function StatsSection({ section }: SectionViewProps<SectionOfType<'stats'>>) {
  const cards = section.variant === 'cards';
  return (
    <SectionShell background={section.background} paddingY={section.paddingY}>
      <Container wide>
        <SectionHead heading={section.heading} subheading={section.subheading} />
        <div
          className={`grid grid-cols-2 lg:grid-cols-4 ${section.heading || section.subheading ? 'mt-12' : ''}`}
          style={{ gap: 'var(--ws-gap)' }}
        >
          {section.items.map((item, i) => {
            const body = (
              <>
                <p className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl" style={{ fontFamily: 'var(--ws-font-heading)', color: 'var(--ws-primary)' }}>
                  {item.value}
                </p>
                <p className="mt-2 text-sm" style={{ fontFamily: 'var(--ws-font-body)', opacity: 0.7 }}>
                  {item.label}
                </p>
              </>
            );
            return cards ? (
              <Card key={i} className="p-7 text-center">
                {body}
              </Card>
            ) : (
              <div key={i} className="text-center">
                {body}
              </div>
            );
          })}
        </div>
      </Container>
    </SectionShell>
  );
}
