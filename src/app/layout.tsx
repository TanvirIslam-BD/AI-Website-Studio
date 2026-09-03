import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { BRAND } from '@/lib/brand';
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

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} - ${BRAND.slogan}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  openGraph: {
    type: 'website',
    siteName: BRAND.name,
    title: `${BRAND.name} - ${BRAND.slogan}`,
    description: BRAND.description,
  },
  twitter: { card: 'summary_large_image', title: BRAND.name, description: BRAND.description },
  metadataBase: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL) : undefined,
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
