import type { SectionOfType } from '@/lib/website/sections';
import { Card, Container, GRID_COLUMNS, Heading, Icon, Img, Prose, SectionShell, type SectionViewProps } from '../primitives';
import { SectionHead } from './SectionHead';

export function FeaturesSection({ section }: SectionViewProps<SectionOfType<'features'>>) {
  const { items, columns, variant, align } = section;

  if (variant === 'alternating') {
    return (
      <SectionShell background={section.background} paddingY={section.paddingY}>
        <Container>
          <SectionHead eyebrow={section.eyebrow} heading={section.heading} subheading={section.subheading} align={align} />
          <div className="mt-14 space-y-16">
            {items.map((item, i) => (
              <div key={i} className="grid items-center gap-8 lg:grid-cols-2">
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <Heading level={3}>{item.title}</Heading>
                  <Prose className="mt-3">{item.description}</Prose>
                </div>
                <Img src={item.image?.url} alt={item.image?.alt ?? item.title} ratio="4/3" className="w-full" />
              </div>
            ))}
          </div>
        </Container>
      </SectionShell>
    );
  }

  if (variant === 'list') {
    return (
      <SectionShell background={section.background} paddingY={section.paddingY}>
        <Container>
          <SectionHead eyebrow={section.eyebrow} heading={section.heading} subheading={section.subheading} align={align} />
          <ul className="mt-12 divide-y" style={{ borderColor: 'var(--sec-border)' }}>
            {items.map((item, i) => (
              <li key={i} className="flex gap-5 py-6" style={{ borderColor: 'var(--sec-border)' }}>
                <span className="mt-0.5 shrink-0" style={{ color: 'var(--ws-primary)' }}>
                  <Icon name={item.icon} className="h-6 w-6" />
                </span>
                <div>
                  <Heading level={4}>{item.title}</Heading>
                  <Prose size="sm" className="mt-1.5">
                    {item.description}
                  </Prose>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </SectionShell>
    );
  }

  const plain = variant === 'plain';

  return (
    <SectionShell background={section.background} paddingY={section.paddingY}>
      <Container>
        <SectionHead eyebrow={section.eyebrow} heading={section.heading} subheading={section.subheading} align={align} />
        <div className={`mt-14 grid ${GRID_COLUMNS[columns] ?? GRID_COLUMNS[3]}`} style={{ gap: 'var(--ws-gap)' }}>
          {items.map((item, i) => {
            const body = (
              <>
                <span
                  className="inline-flex h-11 w-11 items-center justify-center"
                  style={{ background: 'var(--ws-primary-soft)', color: 'var(--ws-primary)', borderRadius: 'var(--ws-radius)' }}
                >
                  <Icon name={item.icon} />
                </span>
                <Heading level={3} className="mt-5">
                  {item.title}
                </Heading>
                <Prose size="sm" className="mt-2.5">
                  {item.description}
                </Prose>
              </>
            );
            return plain ? (
              <div key={i}>{body}</div>
            ) : (
              <Card key={i} className="p-7">
                {body}
              </Card>
            );
          })}
        </div>
      </Container>
    </SectionShell>
  );
}
