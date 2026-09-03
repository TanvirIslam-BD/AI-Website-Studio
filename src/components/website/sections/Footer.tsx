import { Facebook, Github, Instagram, Linkedin, Twitter, Youtube, type LucideIcon } from 'lucide-react';
import type { SectionOfType } from '@/lib/website/sections';
import { Container, Prose, SectionShell, resolveLink, type SectionViewProps } from '../primitives';

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  x: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
  tiktok: Youtube,
  dribbble: Github,
};

export function FooterSection({ section, hrefFor }: SectionViewProps<SectionOfType<'footer'>>) {
  const socials = (
    <div className="flex gap-2">
      {section.socials.map((social, i) => {
        const SocialIcon = SOCIAL_ICONS[social.platform] ?? Github;
        return (
          <a
            key={i}
            href={social.href}
            aria-label={social.platform}
            className="inline-flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-70"
            style={{ border: '1px solid var(--sec-border)', borderRadius: 'var(--ws-radius)' }}
          >
            <SocialIcon className="h-4 w-4" strokeWidth={1.75} />
          </a>
        );
      })}
    </div>
  );

  const brand = (
    <div>
      <p className="text-lg font-bold tracking-[-0.01em]" style={{ fontFamily: 'var(--ws-font-heading)' }}>
        {section.logoText}
      </p>
      {section.tagline ? (
        <Prose size="sm" className="mt-2.5 max-w-xs">
          {section.tagline}
        </Prose>
      ) : null}
    </div>
  );

  const legal = section.legal ? (
    <p className="text-xs" style={{ fontFamily: 'var(--ws-font-body)', opacity: 0.6 }}>
      {section.legal}
    </p>
  ) : null;

  if (section.variant === 'centered') {
    return (
      <SectionShell background={section.background} paddingY="sm">
        <Container>
          <div className="flex flex-col items-center gap-6 text-center">
            {brand}
            {socials}
            {legal}
          </div>
        </Container>
      </SectionShell>
    );
  }

  if (section.variant === 'simple') {
    return (
      <SectionShell background={section.background} paddingY="sm">
        <Container wide>
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
            {brand}
            <div className="flex items-center gap-6">
              {socials}
              {legal}
            </div>
          </div>
        </Container>
      </SectionShell>
    );
  }

  return (
    <SectionShell background={section.background} paddingY="md">
      <Container wide>
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_repeat(auto-fit,minmax(0,1fr))]">
          {brand}
          {section.columns.map((column, i) => (
            <div key={i}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em]" style={{ fontFamily: 'var(--ws-font-body)', opacity: 0.55 }}>
                {column.title}
              </p>
              <ul className="space-y-2.5">
                {column.links.map((link, j) => {
                  const resolved = resolveLink(link, hrefFor)!;
                  return (
                    <li key={j}>
                      <a href={resolved.href} className="text-sm transition-opacity hover:opacity-70" style={{ fontFamily: 'var(--ws-font-body)', opacity: 0.8 }}>
                        {resolved.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-7 sm:flex-row"
          style={{ borderColor: 'var(--sec-border)' }}
        >
          {legal}
          {socials}
        </div>
      </Container>
    </SectionShell>
  );
}
