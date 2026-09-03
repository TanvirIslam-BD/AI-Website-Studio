import type { SectionOfType } from '@/lib/website/sections';
import { Button, Container, Eyebrow, Heading, Img, Prose, SectionShell, isInverted, resolveLink, type SectionViewProps } from '../primitives';

export function HeroSection({ section, theme, hrefFor, decorative }: SectionViewProps<SectionOfType<'hero'>>) {
  const inverted = isInverted(section.background) || section.variant === 'imageBackground';
  const primary = resolveLink(section.primaryCta, hrefFor);
  const secondary = resolveLink(section.secondaryCta, hrefFor);
  const centered = section.align === 'center' || section.variant === 'centered' || section.variant === 'imageBackground';

  const copy = (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-xl'}>
      <Eyebrow>{section.eyebrow}</Eyebrow>
      {/* Demoted when embedded as illustration, so the host page keeps a single h1. */}
      <Heading level={decorative ? 2 : 1}>{section.heading}</Heading>
      {section.subheading ? (
        <Prose size="lg" className="mt-5">
          {section.subheading}
        </Prose>
      ) : null}
      {primary || secondary ? (
        <div className={`mt-8 flex flex-wrap items-center gap-3 ${centered ? 'justify-center' : ''}`}>
          <Button link={primary} theme={theme} size="lg" inverted={inverted} />
          <Button link={secondary} theme={theme} tone="secondary" size="lg" inverted={inverted} />
        </div>
      ) : null}
    </div>
  );

  if (section.variant === 'imageBackground') {
    return (
      <SectionShell background={section.background} paddingY="lg" className="overflow-hidden" style={{ ['--sec-fg' as string]: '#ffffff' }}>
        {section.image?.url ? (
          <>
            <img
              src={section.image.url}
              alt={section.image.alt}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ borderRadius: 0 }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(8,10,14,0.55), rgba(8,10,14,0.78))' }} />
          </>
        ) : null}
        <Container className="relative py-10">{copy}</Container>
      </SectionShell>
    );
  }

  if (section.variant === 'minimal' || !section.image?.url) {
    return (
      <SectionShell background={section.background} paddingY={section.paddingY}>
        <Container>{copy}</Container>
      </SectionShell>
    );
  }

  if (section.variant === 'centered') {
    return (
      <SectionShell background={section.background} paddingY={section.paddingY}>
        <Container>
          {copy}
          <Img src={section.image.url} alt={section.image.alt} ratio="16/9" className="mt-12 w-full" style={{ boxShadow: 'var(--ws-shadow)' }} />
        </Container>
      </SectionShell>
    );
  }

  return (
    <SectionShell background={section.background} paddingY={section.paddingY}>
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {copy}
          <Img src={section.image.url} alt={section.image.alt} ratio="4/3" className="w-full" style={{ boxShadow: 'var(--ws-shadow)' }} />
        </div>
      </Container>
    </SectionShell>
  );
}
