import { Star } from 'lucide-react';
import type { SectionOfType } from '@/lib/website/sections';
import { Card, Container, Img, Prose, SectionShell, type SectionViewProps } from '../primitives';
import { SectionHead } from './SectionHead';

function Rating({ value }: { value?: number }) {
  if (!value) return null;
  return (
    <div className="mb-4 flex gap-1" style={{ color: 'var(--ws-primary)' }} aria-label={`${value} out of 5`}>
      {Array.from({ length: value }, (_, i) => (
        <Star key={i} className="h-4 w-4" fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  );
}

function Author({ name, role, avatar }: { name: string; role: string; avatar?: { url: string; alt: string } }) {
  if (!name && !role) return null;
  return (
    <div className="mt-5 flex items-center gap-3">
      {avatar?.url ? (
        <Img src={avatar.url} alt={avatar.alt || name} className="h-10 w-10 shrink-0" style={{ borderRadius: '9999px' }} />
      ) : null}
      <div className="text-sm leading-tight">
        <p className="font-semibold" style={{ fontFamily: 'var(--ws-font-body)' }}>
          {name}
        </p>
        {role ? <p style={{ opacity: 0.65 }}>{role}</p> : null}
      </div>
    </div>
  );
}

export function TestimonialsSection({ section }: SectionViewProps<SectionOfType<'testimonials'>>) {
  const { items, variant } = section;

  if (variant === 'single') {
    const item = items[0];
    if (!item) return null;
    return (
      <SectionShell background={section.background} paddingY={section.paddingY}>
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Rating value={item.rating} />
            <blockquote
              className="text-2xl font-medium leading-snug sm:text-3xl"
              style={{ fontFamily: 'var(--ws-font-heading)' }}
            >
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <div className="flex justify-center">
              <Author name={item.name} role={item.role} avatar={item.avatar} />
            </div>
          </div>
        </Container>
      </SectionShell>
    );
  }

  const compact = variant === 'compact';

  return (
    <SectionShell background={section.background} paddingY={section.paddingY}>
      <Container wide>
        <SectionHead eyebrow={section.eyebrow} heading={section.heading} subheading={section.subheading} />
        <div
          className={`mt-12 grid ${compact ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}
          style={{ gap: 'var(--ws-gap)' }}
        >
          {items.map((item, i) =>
            compact ? (
              <div key={i}>
                <Rating value={item.rating} />
                <Prose size="sm">{item.quote}</Prose>
                <Author name={item.name} role={item.role} avatar={item.avatar} />
              </div>
            ) : (
              <Card key={i} className="flex flex-col p-7">
                <Rating value={item.rating} />
                <blockquote className="flex-1 text-[15px] leading-relaxed" style={{ fontFamily: 'var(--ws-font-body)' }}>
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <Author name={item.name} role={item.role} avatar={item.avatar} />
              </Card>
            ),
          )}
        </div>
      </Container>
    </SectionShell>
  );
}
