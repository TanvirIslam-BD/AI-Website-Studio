import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-studio-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AI Website Studio',
    template: '%s | AI Website Studio',
  },
  description:
    'Describe your business and get a real, editable website. Generate with AI, refine in a visual editor, and deploy to Vercel in one click.',
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
