import type { SectionOfType } from '@/lib/website/sections';
import { Button, Container, Eyebrow, Heading, Img, Prose, SectionShell, isInverted, resolveLink, type SectionViewProps } from '../primitives';
import { withAlpha } from '@/lib/website/color';

/** The colour the scrim is built from, so the section's variables can match it. */
const SCRIM_BASE = '#080a0e';

export function HeroSection({ section, theme, hrefFor, decorative }: SectionViewProps<SectionOfType<'hero'>>) {
  const onPhoto = section.variant === 'imageBackground';
  const inverted = isInverted(section.background) || onPhoto;
  /**
   * The primary button keeps the brand colour over a photograph.
   *
   * Inverting it paints it in `--sec-fg` on `--sec-bg`, which over a scrim is a
   * white pill - the same shape this design uses for *secondary* everywhere
   * else, and the accent is the one piece of brand a scrim has not already
   * washed out. A toned background still inverts it, which is long-standing.
   */
  const invertPrimary = isInverted(section.background);
  const primary = resolveLink(section.primaryCta, hrefFor);
  const secondary = resolveLink(section.secondaryCta, hrefFor);
  const centered = section.align === 'center' || section.variant === 'centered' || onPhoto;

  const copy = (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-xl'}>
      <Eyebrow onDark={onPhoto}>{section.eyebrow}</Eyebrow>
      {/* Demoted when embedded as illustration, so the host page keeps a single h1. */}
      <Heading level={decorative ? 2 : 1} decorative={decorative}>{section.heading}</Heading>
      {section.subheading ? (
        <Prose size="lg" className="mt-5">
          {section.subheading}
        </Prose>
      ) : null}
      {primary || secondary ? (
        <div className={`mt-8 flex flex-wrap items-center gap-3 ${centered ? 'justify-center' : ''}`}>
          <Button link={primary} theme={theme} size="lg" inverted={invertPrimary} />
          <Button link={secondary} theme={theme} tone="secondary" size="lg" inverted={inverted} />
        </div>
      ) : null}
    </div>
  );

  if (section.variant === 'imageBackground') {
    return (
      <SectionShell
        background={section.background}
        paddingY="lg"
        className="overflow-hidden"
        /**
         * All three, not just the foreground. The shell inherits `--sec-bg` and
         * `--sec-border` from the page's own ground, and over a scrim that made
         * the outlined button's border invisible and any element painted in
         * `--sec-bg` unreadable. They are pinned to the scrim instead.
         */
        style={{
          ['--sec-fg' as string]: '#ffffff',
          ['--sec-bg' as string]: SCRIM_BASE,
          ['--sec-border' as string]: 'rgba(255,255,255,0.34)',
        }}
      >
        {section.image?.url ? (
          <>
            <img
              src={section.image.url}
              alt={section.image.alt}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ borderRadius: 0 }}
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${withAlpha(SCRIM_BASE, 0.55)}, ${withAlpha(SCRIM_BASE, 0.8)})` }} />
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
