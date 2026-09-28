import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Inter, Poppins } from 'next/font/google';
import { BRAND } from '@/lib/brand';
import { IS_INDEXABLE_DEPLOYMENT, SITE_ORIGIN } from '@/lib/seo';
import { SiteStructuredData } from '@/components/seo/structured-data';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-studio-sans',
  display: 'swap',
});

/** The wordmark typeface. Geometric sans, matching the brand lockup. */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-brand',
  display: 'swap',
});

/**
 * The display face for the marketing headlines. A high-contrast serif gives the
 * large type an editorial, considered register that a geometric sans cannot,
 * and its italic carries emphasis without needing a colour.
 */
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

/**
 * The default title names the category before the brand.
 *
 * `Build Smarter · Launch Faster` is a good line on the page and a poor one in
 * a result list: it says nothing about what the product does, so the only query
 * it could ever match is the brand - and the brand is the one query that does
 * not need help. What people search for is the category.
 *
 * `metadataBase` falls back to the production origin rather than going
 * undefined, because undefined silently drops every canonical and Open Graph
 * URL on the site - which is exactly what had happened.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: `AI Website Generator & Builder | ${BRAND.name}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: BRAND.name,
    url: '/',
    title: `AI Website Generator & Builder | ${BRAND.name}`,
    description: BRAND.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `AI Website Generator & Builder | ${BRAND.name}`,
    description: BRAND.description,
  },
  robots: IS_INDEXABLE_DEPLOYMENT
    ? {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
      }
    : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-full font-sans antialiased">
        {children}
        <SiteStructuredData />
      </body>
    </html>
  );
}
