import type { SectionOfType } from '@/lib/website/sections';
import { Button, Container, Eyebrow, Heading, Img, Prose, SectionShell, isInverted, resolveLink, type SectionViewProps } from '../primitives';

export function CtaSection({ section, theme, hrefFor, decorative }: SectionViewProps<SectionOfType<'cta'>>) {
  const inverted = isInverted(section.background);
  const primary = resolveLink(section.primaryCta, hrefFor);
  const secondary = resolveLink(section.secondaryCta, hrefFor);

  const actions = (
    <div className={`flex flex-wrap items-center gap-3 ${section.variant === 'boxed' ? 'justify-center' : ''}`}>
      <Button link={primary} theme={theme} size="lg" inverted={inverted} />
      <Button link={secondary} theme={theme} tone="secondary" size="lg" inverted={inverted} />
    </div>
  );

  if (section.variant === 'split') {
    return (
      <SectionShell background={section.background} paddingY={section.paddingY}>
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <Eyebrow>{section.eyebrow}</Eyebrow>
              <Heading level={2} decorative={decorative}>{section.heading}</Heading>
              {section.subheading ? <Prose className="mt-3">{section.subheading}</Prose> : null}
            </div>
            {actions}
          </div>
        </Container>
      </SectionShell>
    );
  }

  if (section.variant === 'banner') {
    return (
      <SectionShell background={section.background} paddingY="sm">
        <Container wide>
          <div className="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
            <div>
              <Heading level={3} decorative={decorative}>{section.heading}</Heading>
              {section.subheading ? (
                <Prose size="sm" className="mt-1.5">
                  {section.subheading}
                </Prose>
              ) : null}
            </div>
            {actions}
          </div>
        </Container>
      </SectionShell>
    );
  }

  // boxed: an inset panel, so the band reads as a deliberate conversion moment
  const panelBg = section.background === 'inverse' ? 'var(--ws-inverse)' : section.background === 'primary' ? 'var(--ws-primary)' : 'var(--ws-surface)';
  const panelFg = section.background === 'inverse' ? 'var(--ws-inverse-fg)' : section.background === 'primary' ? 'var(--ws-primary-fg)' : 'var(--ws-text)';

  return (
    <SectionShell background="default" paddingY={section.paddingY}>
      <Container wide>
        <div
          className="relative overflow-hidden px-8 py-16 text-center sm:px-14"
          style={{
            background: panelBg,
            color: panelFg,
            borderRadius: 'var(--ws-radius-lg)',
            ['--sec-fg' as string]: panelFg,
            ['--sec-bg' as string]: panelBg,
            ['--sec-border' as string]: inverted ? 'rgba(255,255,255,0.24)' : 'var(--ws-border)',
          }}
        >
          {section.image?.url ? (
            <>
              <Img src={section.image.url} alt={section.image.alt} className="absolute inset-0 h-full w-full" style={{ borderRadius: 0, opacity: 0.3 }} />
              <div className="absolute inset-0" style={{ background: panelBg, opacity: 0.72 }} />
            </>
          ) : null}
          <div className="relative mx-auto max-w-2xl">
            <Eyebrow>{section.eyebrow}</Eyebrow>
            <Heading level={2} decorative={decorative}>{section.heading}</Heading>
            {section.subheading ? <Prose className="mt-4">{section.subheading}</Prose> : null}
            <div className="mt-8">{actions}</div>
          </div>
        </div>
      </Container>
    </SectionShell>
  );
}
