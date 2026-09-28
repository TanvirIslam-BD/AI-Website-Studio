import { Container, Section, SectionHeading } from './shell';

/**
 * The studio itself, in screenshots.
 *
 * Everything here is a capture of the real product - the same six frames the
 * Vercel listing uses - rather than an illustration of it. That matters more
 * than it sounds: a marketing page for a website builder is judged on whether
 * the thing it is selling looks good, and a drawn mock-up of an editor proves
 * nothing about the editor.
 *
 * Composed rather than gridded: one frame at full size carries the section, a
 * second overlaps its corner, and the rest sit below as a strip. That is the
 * shape these product pages take because it reads as depth without needing an
 * illustration behind it.
 */

const HERO_SHOT = {
  src: '/product/02-editor.webp',
  alt: 'The Web Copilot editor: section list, live canvas and the AI copilot side by side.',
};

const INSET_SHOT = {
  src: '/product/05-deploy.webp',
  alt: 'The deploy dialog, listing the exact files that will be published.',
};

const STRIP = [
  { src: '/product/01-dashboard.webp', label: 'Describe it', detail: 'One sentence, and a brief as long as you like.', alt: 'The dashboard prompt box with example briefs.' },
  { src: '/product/03-section-selected.webp', label: 'Tune any section', detail: 'Every field is typed, so nothing breaks.', alt: 'A selected section with its editable fields.' },
  { src: '/product/04-theme.webp', label: 'Set the brand', detail: 'Type, colour, radius and spacing.', alt: 'Brand kit presets and the theme controls.' },
  { src: '/product/06-preview.webp', label: 'Ship it', detail: 'Static HTML, in your own Vercel account.', alt: 'A generated website as a visitor sees it.' },
];

/** Browser chrome, so a screenshot reads as a window rather than a picture. */
function Frame({
  src,
  alt,
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure className={`overflow-hidden rounded-xl border border-white/10 bg-ink-900 shadow-pop ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
      </div>
      {/*
        Plain <img>, matching the rest of the site. Width and height are the
        real pixel dimensions so the box is reserved before the file arrives and
        nothing below it jumps.
      */}
      <img
        src={src}
        alt={alt}
        width={1600}
        height={900}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="block aspect-video w-full object-cover"
      />
    </figure>
  );
}

export function StudioGallery() {
  return (
    <Section id="studio" tone="dark">
      <Container>
        <SectionHeading
          dark
          eyebrow="Inside the studio"
          title="This is the *actual product.*"
          body="Not an illustration of an editor - the editor. Every frame below is a capture of the running app."
        />

        <div className="reveal relative mt-14">
          <Frame {...HERO_SHOT} />

          {/*
            Overlapping the corner, and hidden on small screens: at that width it
            would cover the thing it is meant to sit beside.
          */}
          <div className="pointer-events-none absolute -bottom-10 -right-4 hidden w-[38%] max-w-sm lg:block">
            <Frame {...INSET_SHOT} className="ring-1 ring-black/40" />
          </div>
        </div>

        <ul className="mt-16 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
          {STRIP.map((shot, index) => (
            <li key={shot.src} className="reveal" style={{ transitionDelay: `${index * 60}ms` }}>
              <Frame src={shot.src} alt={shot.alt} />
              <p className="mt-4 text-[14px] font-semibold tracking-[-0.01em] text-white">{shot.label}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-400">{shot.detail}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
