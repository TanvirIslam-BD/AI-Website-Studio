'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const EXAMPLES = [
  'A modern website for a photography business',
  'A neighbourhood Italian restaurant',
  'A landing page for a project management SaaS',
  'A boutique hair salon',
];

/**
 * The real entry point.
 *
 * Whatever is typed here is carried through sign-in as a query parameter, so a
 * visitor's first idea survives the auth redirect and generation starts from
 * it. `tone` lets the same control sit on the light page or the dark closing
 * band without a second implementation.
 */
export function PromptStarter({ signedIn, tone = 'light' }: { signedIn: boolean; tone?: 'light' | 'dark' }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const dark = tone === 'dark';

  function start(brief: string) {
    const value = brief.trim();
    const target = signedIn ? '/dashboard' : '/signin?mode=register';
    const separator = target.includes('?') ? '&' : '?';
    router.push(value ? `${target}${separator}prompt=${encodeURIComponent(value)}` : target);
  }

  return (
    <div className="text-left">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          start(prompt);
        }}
        className={cn(
          'rounded-xl border p-2 transition-colors',
          dark ? 'border-white/15 bg-white/[0.04] focus-within:border-white/30' : 'border-ink-200 bg-white shadow-lift',
        )}
      >
        <label htmlFor="brief" className="sr-only">
          Describe the website you want
        </label>
        <textarea
          id="brief"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Create a modern website for a premium photography studio..."
          rows={3}
          className={cn(
            'w-full resize-none border-0 bg-transparent px-3 py-2.5 text-[15px] leading-relaxed outline-none',
            dark ? 'text-white placeholder:text-ink-500' : 'text-ink-900 placeholder:text-ink-400',
          )}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) start(prompt);
          }}
        />
        <div className="flex items-center justify-between gap-3 px-1 pb-0.5">
          <span className={cn('font-mono text-[10px]', dark ? 'text-ink-500' : 'text-ink-400')}>Cmd + Enter</span>
          <button
            type="submit"
            className={cn(
              'focus-ring group inline-flex h-10 items-center gap-2 rounded-lg px-5 text-[14px] font-medium transition-colors',
              dark ? 'bg-white text-ink-950 hover:bg-ink-100' : 'bg-ink-950 text-white hover:bg-ink-800',
            )}
          >
            Generate website
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setPrompt(example)}
            className={cn(
              'focus-ring rounded-full border px-3 py-1.5 text-[12px] transition-colors',
              dark
                ? 'border-white/15 text-ink-400 hover:border-white/35 hover:text-white'
                : 'border-ink-200 text-ink-500 hover:border-ink-400 hover:text-ink-900',
            )}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
