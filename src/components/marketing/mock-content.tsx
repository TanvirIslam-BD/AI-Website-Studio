import { AVATARS, stockImages } from '@/lib/website/stock';

/**
 * Real content for the product mockups.
 *
 * The panels on this page are illustrations of the interface, and grey
 * rectangles made them read as wireframes rather than a working product. They
 * now use the same photography the generator actually picks, and real copy from
 * a generated site, so the mockups look like the thing they depict.
 *
 * Images are requested at the size they are displayed - a 60px thumbnail has no
 * business downloading a 1600px original - and rendered in grayscale to stay
 * inside the monochrome identity.
 */

/** Narrows the CDN width parameter to what a given slot actually needs. */
function atWidth(url: string, width: number): string {
  return url.replace('w=1600', `w=${width}`);
}

const PHOTOGRAPHY = stockImages('photography', 6);

export const MOCK = {
  brand: 'Aperture & Light',
  domain: 'aperture-light.vercel.app',
  eyebrow: 'Portrait & editorial photography',
  headline: 'Photographs that feel like you',
  body: 'Natural, unhurried sessions in studio or on location, delivered in two weeks.',
  nav: ['Home', 'Work', 'About', 'Contact'],
  cta: 'Enquire',
  hero: (width: number) => atWidth(PHOTOGRAPHY[0], width),
  gallery: (count: number, width: number) => PHOTOGRAPHY.slice(1, 1 + count).map((url) => atWidth(url, width)),
  portrait: (width: number) => atWidth(PHOTOGRAPHY[4], width),
  avatars: (count: number) => AVATARS.slice(0, count),

  /** Short strings for the section thumbnails, where real copy beats grey bars. */
  services: [
    { title: 'Portraits', body: 'Studio or on location' },
    { title: 'Weddings', body: 'Full-day coverage' },
    { title: 'Commercial', body: 'Brand and product' },
  ],
  stats: [
    { value: '10+', label: 'Years' },
    { value: '240', label: 'Projects' },
    { value: '4.9', label: 'Rating' },
    { value: '48h', label: 'Reply' },
  ],
  logos: ['Fernway', 'Loom', 'Kestrel', 'Highline', 'Verdant'],
  quote: 'They understood the brief in the first meeting.',
  author: 'Amara Okafor',
  question: 'How long does a project take?',
  plans: [
    { name: 'Starter', price: '$1,500' },
    { name: 'Business', price: '$3,900' },
    { name: 'Custom', price: 'Talk' },
  ],
  team: [
    { name: 'Maya Bennett', role: 'Founder' },
    { name: 'Tomas H.', role: 'Developer' },
    { name: 'Sarah Idris', role: 'Partner' },
  ],
} as const;

/**
 * A real photograph in a mockup slot.
 *
 * Always decorative: these illustrate the interface rather than convey
 * information, so an empty alt keeps them out of the accessibility tree
 * instead of narrating "photograph" to a screen reader six times.
 */
export function MockImg({
  src,
  className = '',
  ratio,
}: {
  src: string;
  className?: string;
  ratio?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      className={`object-cover grayscale ${className}`}
      style={{ aspectRatio: ratio }}
    />
  );
}
