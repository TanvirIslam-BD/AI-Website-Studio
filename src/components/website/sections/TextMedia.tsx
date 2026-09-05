import { Check } from 'lucide-react';
import type { SectionOfType } from '@/lib/website/sections';
import { anchorId, Button, Container, Eyebrow, Heading, Img, Prose, SectionShell, isInverted, resolveLink, type SectionViewProps } from '../primitives';

export function TextMediaSection({ section, theme, hrefFor, decorative }: SectionViewProps<SectionOfType<'textMedia'>>) {
  const cta = resolveLink(section.cta, hrefFor);
  const inverted = isInverted(section.background);

  const copy = (
    <div>
      <Eyebrow>{section.eyebrow}</Eyebrow>
      <Heading level={2} decorative={decorative}>{section.heading}</Heading>
      {section.body ? (
        <div className="mt-5 space-y-4">
          {section.body.split(/\n\n+/).map((paragraph, i) => (
            <Prose key={i}>{paragraph}</Prose>
          ))}
        </div>
      ) : null}
      {section.bullets.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {section.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px]" style={{ fontFamily: 'var(--ws-font-body)' }}>
              <span
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center"
                style={{ background: 'var(--ws-primary-soft)', color: 'var(--ws-primary)', borderRadius: '9999px' }}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span style={{ opacity: 0.85 }}>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {cta ? (
        <div className="mt-8">
          <Button link={cta} theme={theme} inverted={inverted} />
        </div>
      ) : null}
    </div>
  );

  if (section.variant === 'stacked' || !section.image?.url) {
    return (
      <SectionShell background={section.background} paddingY={section.paddingY} id={anchorId('about', decorative)}>
        <Container>
          <div className="max-w-3xl">{copy}</div>
          {section.image?.url ? (
            <Img src={section.image.url} alt={section.image.alt} ratio="21/9" className="mt-12 w-full" />
          ) : null}
        </Container>
      </SectionShell>
    );
  }

  return (
    <SectionShell background={section.background} paddingY={section.paddingY} id={anchorId('about', decorative)}>
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className={section.variant === 'imageLeft' ? 'lg:order-2' : ''}>{copy}</div>
          <Img src={section.image.url} alt={section.image.alt} ratio="4/3" className="w-full" />
        </div>
      </Container>
    </SectionShell>
  );
}
