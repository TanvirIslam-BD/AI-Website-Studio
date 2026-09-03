'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/field';

const EXAMPLES = [
  'A modern website for a photography business',
  'A site for a neighbourhood Italian restaurant',
  'A landing page for a project management SaaS',
  'A website for a boutique hair salon',
];

/**
 * Landing-page entry point. The brief is carried through sign-in as a query
 * param, so a visitor's first idea is not lost by the auth redirect.
 */
export function PromptStarter({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');

  function start(brief: string) {
    const value = brief.trim();
    const target = signedIn ? '/dashboard' : '/signin';
    router.push(value ? `${target}?prompt=${encodeURIComponent(value)}` : target);
  }

  return (
    <div className="text-left">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          start(prompt);
        }}
        className="rounded-2xl border border-ink-200 bg-white p-2 shadow-panel"
      >
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Create a modern website for a photography business..."
          rows={3}
          className="border-0 text-[15px] shadow-none focus-visible:ring-0"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) start(prompt);
          }}
        />
        <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-1">
          <span className="text-xs text-ink-400">Cmd/Ctrl + Enter</span>
          <Button type="submit" variant="primary" size="md">
            Generate website <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setPrompt(example)}
            className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-600 transition-colors hover:border-ink-300 hover:text-ink-900"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
