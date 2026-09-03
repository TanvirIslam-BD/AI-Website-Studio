import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { SectionOfType } from '@/lib/website/sections';
import { Container, Heading, Prose, SectionShell, type SectionViewProps } from '../primitives';
import { SectionHead } from './SectionHead';

const FIELD_STYLE = {
  background: 'var(--ws-bg)',
  border: '1px solid var(--ws-border)',
  borderRadius: 'var(--ws-radius)',
  color: 'var(--ws-text)',
  fontFamily: 'var(--ws-font-body)',
} as const;

function Detail({ icon, value, href }: { icon: React.ReactNode; value: string; href?: string }) {
  if (!value) return null;
  const content = (
    <span className="text-[15px]" style={{ fontFamily: 'var(--ws-font-body)', opacity: 0.82 }}>
      {value}
    </span>
  );
  return (
    <li className="flex items-start gap-3.5">
      <span className="mt-0.5 shrink-0" style={{ color: 'var(--ws-primary)' }}>
        {icon}
      </span>
      {href ? (
        <a href={href} className="transition-opacity hover:opacity-70">
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
}

/**
 * The form is progressive: it carries `data-ws-contact` and the destination
 * address, and the exported site attaches a tiny handler that composes a
 * mailto: message. No server code is generated or executed for a deployed site.
 */
export function ContactSection({ section }: SectionViewProps<SectionOfType<'contact'>>) {
  const details = (
    <ul className="space-y-4">
      <Detail icon={<Mail className="h-5 w-5" />} value={section.email} href={section.email ? `mailto:${section.email}` : undefined} />
      <Detail icon={<Phone className="h-5 w-5" />} value={section.phone} href={section.phone ? `tel:${section.phone.replace(/[^\d+]/g, '')}` : undefined} />
      <Detail icon={<MapPin className="h-5 w-5" />} value={section.address} />
      <Detail icon={<Clock className="h-5 w-5" />} value={section.hours} />
    </ul>
  );

  const form = section.showForm ? (
    <form
      data-ws-contact=""
      data-ws-email={section.email}
      className="grid gap-4"
      style={{ background: 'var(--ws-surface)', border: '1px solid var(--ws-border)', borderRadius: 'var(--ws-radius-lg)', padding: '28px' }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ opacity: 0.6 }}>Name</span>
          <input name="name" required placeholder="Jane Doe" className="px-3.5 py-2.5 text-sm outline-none" style={FIELD_STYLE} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ opacity: 0.6 }}>Email</span>
          <input name="email" type="email" required placeholder="jane@company.com" className="px-3.5 py-2.5 text-sm outline-none" style={FIELD_STYLE} />
        </label>
      </div>
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ opacity: 0.6 }}>Message</span>
        <textarea name="message" rows={4} required placeholder="Tell us what you need..." className="resize-y px-3.5 py-2.5 text-sm outline-none" style={FIELD_STYLE} />
      </label>
      <button
        type="submit"
        className="mt-1 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-85"
        style={{
          background: 'var(--ws-primary)',
          color: 'var(--ws-primary-fg)',
          borderRadius: 'var(--ws-radius)',
          fontFamily: 'var(--ws-font-body)',
        }}
      >
        {section.submitLabel}
      </button>
    </form>
  ) : null;

  if (section.variant === 'centered') {
    return (
      <SectionShell background={section.background} paddingY={section.paddingY} id="contact">
        <Container>
          <SectionHead eyebrow={section.eyebrow} heading={section.heading} subheading={section.subheading} />
          <div className="mx-auto mt-10 max-w-xl">
            <div className="mb-8 flex flex-wrap justify-center gap-x-8 gap-y-3">{details}</div>
            {form}
          </div>
        </Container>
      </SectionShell>
    );
  }

  return (
    <SectionShell background={section.background} paddingY={section.paddingY} id="contact">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
          <div>
            <SectionHead eyebrow={section.eyebrow} heading={section.heading} subheading={section.subheading} align="left" />
            <div className="mt-8">{details}</div>
          </div>
          {form ?? (
            <div>
              <Heading level={3}>Prefer email?</Heading>
              <Prose className="mt-2">Reach us directly at {section.email}.</Prose>
            </div>
          )}
        </div>
      </Container>
    </SectionShell>
  );
}
