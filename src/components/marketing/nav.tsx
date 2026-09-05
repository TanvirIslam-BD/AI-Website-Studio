'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { BRAND, NAV_LINKS } from '@/lib/brand';
import { Logo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

/**
 * Marketing navigation. Sticky, gains a border once the page scrolls so the
 * hero reads as one uninterrupted surface at the top.
 *
 * The nav links are anchors on the home page. Pass `anchorPrefix="/"` on any
 * other page so they navigate home first instead of pointing at sections that
 * are not there.
 */
export function MarketingNav({
  signedIn,
  anchorPrefix = '',
  /** `dark` for pages that open on a dark hero; the bar inverts until scrolled. */
  tone = 'light',
}: {
  signedIn: boolean;
  anchorPrefix?: string;
  tone?: 'light' | 'dark';
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile sheet when the viewport grows past the breakpoint.
  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const onChange = () => media.matches && setOpen(false);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  /**
   * Over a dark hero the un-scrolled bar has to invert, or it is black type on
   * a black photograph. Once scrolled the bar gains its white surface and the
   * light treatment is correct again, whatever it started as.
   */
  const onDark = tone === 'dark' && !scrolled;

  return (
    /*
      The height lives on the header, not on the row inside it, so the bottom
      border is drawn *within* the 4rem rather than added to it. It used to sit
      on the inner row, which made the bar 65px while everything positioned
      against it - the hero's -mt-16, the sections' scroll-mt-16 - assumed 64.
      That one pixel showed as a white hairline across the top of the dark hero.
    */
    <header
      className={cn(
        'sticky top-0 z-40 box-border h-16 transition-colors duration-200',
        scrolled ? 'border-b border-ink-200 bg-white/80 backdrop-blur-xl' : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" aria-label={BRAND.name}>
          <Logo tone={onDark ? 'light' : 'dark'} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={`${anchorPrefix}${link.href}`}
              className={cn(
                'focus-ring rounded-md px-2.5 py-2 text-[13px] transition-colors',
                onDark ? 'text-white/65 hover:text-white' : 'text-ink-600 hover:text-ink-950',
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <Link
              href="/dashboard"
              className={cn(
                'focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-[13px] font-medium transition-colors',
                onDark ? 'bg-white text-ink-950 hover:bg-white/90' : 'bg-ink-950 text-white hover:bg-ink-800',
              )}
            >
              Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/signin"
                className={cn(
                  'focus-ring hidden rounded-md px-3 py-2 text-[13px] transition-colors sm:block',
                  onDark ? 'text-white/65 hover:text-white' : 'text-ink-600 hover:text-ink-950',
                )}
              >
                Sign in
              </Link>
              <Link
                href="/signin?mode=register"
                className={cn(
                  'focus-ring inline-flex h-9 items-center rounded-lg px-4 text-[13px] font-medium transition-colors',
                  onDark ? 'bg-white text-ink-950 hover:bg-white/90' : 'bg-ink-950 text-white hover:bg-ink-800',
                )}
              >
                Start building free
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className={cn(
              'focus-ring grid h-9 w-9 place-items-center rounded-lg md:hidden',
              onDark ? 'text-white/75 hover:bg-white/10' : 'text-ink-600 hover:bg-ink-50',
            )}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-ink-200/70 bg-white px-5 pb-4 pt-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={`${anchorPrefix}${link.href}`}
              onClick={() => setOpen(false)}
              className="focus-ring block rounded-md px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50"
            >
              {link.label}
            </a>
          ))}
          {!signedIn ? (
            <Link href="/signin" className="focus-ring block rounded-md px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50">
              Sign in
            </Link>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}
