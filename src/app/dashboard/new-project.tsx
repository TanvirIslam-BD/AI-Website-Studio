'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertCircle, FilePlus2, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/field';
import { errorMessage } from '@/lib/utils';
import { MAX_BRIEF_LENGTH } from '@/lib/limits';

const EXAMPLES = [
  'A modern website for a photography business',
  'A neighbourhood Italian restaurant with a short seasonal menu',
  'A landing page for a project management SaaS aimed at agencies',
  'A boutique hair salon that specialises in colour',
  'A law firm offering fixed-fee business advice',
];

/**
 * Generation is a single synchronous request: the server calls the model,
 * validates the result, writes the project, and returns its id. The UI stays
 * honest about the wait rather than faking progress.
 */
export function NewProjectPanel({ initialPrompt }: { initialPrompt?: string }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(initialPrompt ?? '');
  const [busy, setBusy] = useState<null | 'generate' | 'blank'>(null);
  const [error, setError] = useState<string | null>(null);

  async function create(mode: 'generate' | 'blank') {
    if (mode === 'generate' && prompt.trim().length < 8) {
      setError('Tell me a little more about the business - at least a few words.');
      return;
    }
    // Caught here as well as on the server: a long brief is the good case, and
    // finding out it was too long only after a round trip is the bad one.
    if (mode === 'generate' && prompt.trim().length > MAX_BRIEF_LENGTH) {
      setError(
        `That brief is ${prompt.trim().length.toLocaleString()} characters - the limit is ${MAX_BRIEF_LENGTH.toLocaleString()}. Trim it a little and try again.`,
      );
      return;
    }
    setBusy(mode);
    setError(null);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, prompt: prompt.trim() || undefined }),
      });
      const payload = (await response.json()) as { project?: { id: string }; error?: string };
      if (!response.ok || !payload.project) throw new Error(payload.error ?? 'Could not create that project.');
      router.push(`/editor/${payload.project.id}`);
    } catch (caught) {
      setError(errorMessage(caught));
      setBusy(null);
    }
  }

  const over = prompt.trim().length > MAX_BRIEF_LENGTH;

  return (
    <div className="rounded-2xl border border-ink-200 bg-white shadow-panel">
      <div className="p-5">
        <label htmlFor="brief" className="flex items-center gap-2 text-[13px] font-semibold text-ink-800">
          <Sparkles className="h-3.5 w-3.5 text-brand-600" /> Describe the website you want
        </label>
        <Textarea
          id="brief"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={6}
          disabled={busy !== null}
          placeholder="Create a modern website for a photography business, with a portfolio gallery and a contact form..."
          className="mt-3 text-[15px]"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) void create('generate');
          }}
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              disabled={busy !== null}
              onClick={() => setPrompt(example)}
              className="rounded-full border border-ink-200 px-2.5 py-1 text-[11px] text-ink-500 transition-colors hover:border-ink-300 hover:text-ink-800 disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>

        {prompt.length > MAX_BRIEF_LENGTH / 4 ? (
          <p className={`mt-2 text-right text-[11px] tabular-nums ${over ? 'font-semibold text-red-600' : 'text-ink-400'}`}>
            {prompt.length.toLocaleString()} / {MAX_BRIEF_LENGTH.toLocaleString()}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200/70 bg-ink-50/50 px-5 py-3">
        <p className="text-xs text-ink-400">
          {busy === 'generate'
            ? 'Planning pages, writing copy and picking a brand kit. This usually takes 20-40 seconds.'
            : 'Generates pages, sections, copy, imagery and a brand kit.'}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" disabled={busy !== null} onClick={() => void create('blank')}>
            {busy === 'blank' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FilePlus2 className="h-3.5 w-3.5" />}
            Start blank
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={busy === 'generate'}
            disabled={over}
            onClick={() => void create('generate')}
          >
            <Wand2 className="h-3.5 w-3.5" />
            {busy === 'generate' ? 'Generating…' : 'Generate website'}
          </Button>
        </div>
      </div>
    </div>
  );
}
