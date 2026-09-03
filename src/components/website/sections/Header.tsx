import type { SectionOfType } from '@/lib/website/sections';
import { Button, Container, Img, isInverted, resolveLink, type SectionViewProps } from '../primitives';

export function HeaderSection({ section, theme, hrefFor }: SectionViewProps<SectionOfType<'header'>>) {
  const inverted = isInverted(section.background);
  const links = section.links.map((link) => resolveLink(link, hrefFor)!);
  const cta = resolveLink(section.cta, hrefFor);

  const logo = section.logoImage?.url ? (
    <Img src={section.logoImage.url} alt={section.logoImage.alt || section.logoText} className="h-8 w-auto" style={{ borderRadius: 0 }} />
  ) : (
    <span className="text-lg font-bold tracking-[-0.01em]" style={{ fontFamily: 'var(--ws-font-heading)' }}>
      {section.logoText}
    </span>
  );

  const nav = (
    <nav className="flex items-center gap-7" style={{ fontFamily: 'var(--ws-font-body)' }}>
      {links.map((link, i) => (
        <a key={i} href={link.href} className="text-sm font-medium transition-opacity hover:opacity-70" style={{ opacity: 0.82 }}>
          {link.label}
        </a>
      ))}
    </nav>
  );

  return (
    <header
      className="relative z-20 w-full border-b"
      style={{
        background: section.background === 'default' ? 'var(--ws-bg)' : section.background === 'surface' ? 'var(--ws-surface)' : 'var(--ws-primary)',
        color: inverted ? 'var(--ws-primary-fg)' : 'var(--ws-text)',
        borderColor: inverted ? 'rgba(255,255,255,0.18)' : 'var(--ws-border)',
        ['--sec-fg' as string]: inverted ? 'var(--ws-primary-fg)' : 'var(--ws-text)',
        ['--sec-bg' as string]: inverted ? 'var(--ws-primary)' : 'var(--ws-bg)',
        ['--sec-border' as string]: inverted ? 'rgba(255,255,255,0.18)' : 'var(--ws-border)',
      }}
    >
      <Container wide>
        {section.variant === 'centered' ? (
          <div className="flex flex-col items-center gap-4 py-5">
            {logo}
            <div className="hidden md:block">{nav}</div>
            {cta ? <Button link={cta} theme={theme} inverted={inverted} /> : null}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-8 py-4">
            <div className="flex items-center gap-3">{logo}</div>
            <div className={`hidden md:flex ${section.variant === 'split' ? 'flex-1 justify-center' : 'justify-end'}`}>{nav}</div>
            <div className="flex items-center gap-3">
              {cta ? <Button link={cta} theme={theme} inverted={inverted} /> : null}
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
