import { Eyebrow, Heading, Prose } from '../primitives';

/** Shared eyebrow + heading + subheading block used by most body sections. */
export function SectionHead({
  eyebrow,
  heading,
  subheading,
  align = 'center',
  className = '',
  decorative = false,
}: {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  align?: 'left' | 'center';
  className?: string;
  /** See Heading: keeps an illustrated page out of the host's outline. */
  decorative?: boolean;
}) {
  if (!eyebrow && !heading && !subheading) return null;
  return (
    <div className={`${align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading level={2} decorative={decorative}>{heading}</Heading>
      {subheading ? <Prose className="mt-4">{subheading}</Prose> : null}
    </div>
  );
}
