import type { SectionOfType } from '@/lib/website/sections';
import { Container, GRID_COLUMNS, Heading, Img, Prose, SectionShell, type SectionViewProps } from '../primitives';
import { SectionHead } from './SectionHead';

export function TeamSection({ section }: SectionViewProps<SectionOfType<'team'>>) {
  return (
    <SectionShell background={section.background} paddingY={section.paddingY} id="team">
      <Container wide>
        <SectionHead eyebrow={section.eyebrow} heading={section.heading} subheading={section.subheading} />
        <div className={`mt-14 grid ${GRID_COLUMNS[section.columns] ?? GRID_COLUMNS[3]}`} style={{ gap: 'var(--ws-gap)' }}>
          {section.items.map((member, i) => (
            <div key={i}>
              <Img src={member.image?.url} alt={member.image?.alt || member.name} ratio="1/1" className="w-full" />
              <Heading level={3} className="mt-5">
                {member.name}
              </Heading>
              {member.role ? (
                <p className="mt-1 text-sm font-medium" style={{ fontFamily: 'var(--ws-font-body)', color: 'var(--ws-primary)' }}>
                  {member.role}
                </p>
              ) : null}
              {member.bio ? (
                <Prose size="sm" className="mt-2.5">
                  {member.bio}
                </Prose>
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </SectionShell>
  );
}
