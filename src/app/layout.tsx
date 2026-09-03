import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { BRAND } from '@/lib/brand';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-studio-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} - ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  openGraph: {
    type: 'website',
    siteName: BRAND.name,
    title: `${BRAND.name} - ${BRAND.tagline}`,
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
    <html lang="en" className={inter.variable}>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
