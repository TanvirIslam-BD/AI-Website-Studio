'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { BRAND, NAV_LINKS } from '@/lib/brand';
import { Logo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

/**
 * Floating glass navigation for the dark home page.
 *
 * Fixed rather than sticky, so it floats over the hero instead of taking a
 * strip of layout above it. It tightens and gains its glass surface once the
 * page scrolls; at the very top it sits transparent on the hero.
 */
export function HomeNav({ signedIn }: { signedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const onChange = () => media.matches && setOpen(false);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const raised = scrolled || open;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={cn(
          'mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 rounded-2xl border px-3 transition-all duration-300 sm:px-4',
          raised
            ? 'border-white/10 bg-[#0b0b10]/70 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl backdrop-saturate-150'
            : 'border-transparent bg-transparent',
        )}
      >
        <Link href="/" aria-label={BRAND.name} className="focus-ring rounded-lg">
          <Logo tone="light" size={24} />
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="focus-ring rounded-lg px-3 py-2 text-[13px] text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {signedIn ? (
            <Link
              href="/dashboard"
              className="focus-ring inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-xl bg-white px-4 text-[13px] font-medium text-[#07070a] transition-colors hover:bg-white/90"
            >
              Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/signin"
                className="focus-ring hidden rounded-lg px-3 py-2 text-[13px] text-white/60 transition-colors hover:text-white sm:block"
              >
                Sign in
              </Link>
              <Link
                href="/signin?mode=register"
                className="focus-ring inline-flex h-9 items-center whitespace-nowrap rounded-xl bg-white px-4 text-[13px] font-medium text-[#07070a] transition-colors hover:bg-white/90"
              >
                Get started
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="focus-ring grid h-9 w-9 place-items-center rounded-xl text-white/70 hover:bg-white/10 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          className="mx-auto mt-2 max-w-[1200px] rounded-2xl border border-white/10 bg-[#0b0b10]/95 p-2 backdrop-blur-xl md:hidden"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="focus-ring block rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/[0.06]"
            >
              {link.label}
            </a>
          ))}
          {!signedIn ? (
            <Link href="/signin" className="focus-ring block rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/[0.06]">
              Sign in
            </Link>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}
