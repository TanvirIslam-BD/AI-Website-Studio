'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertCircle, FilePlus2, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { errorMessage } from '@/lib/utils';
import { MAX_BRIEF_LENGTH } from '@/lib/limits';
import type { GenerationProgress } from '@/lib/ai/progress';
import { GenerationPanel } from './generation-progress';

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
  const [events, setEvents] = useState<GenerationProgress[]>([]);

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
    setEvents([]);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Ask for progress. A blank project has none to report, and the
          // server answers plain JSON when this is absent.
          ...(mode === 'generate' ? { Accept: 'text/event-stream' } : {}),
        },
        body: JSON.stringify({ mode, prompt: prompt.trim() || undefined }),
      });

      if (mode !== 'generate' || !response.headers.get('content-type')?.includes('text/event-stream')) {
        const payload = (await response.json()) as { project?: { id: string }; error?: string };
        if (!response.ok || !payload.project) throw new Error(payload.error ?? 'Could not create that project.');
        router.push(`/editor/${payload.project.id}`);
        return;
      }

      const projectId = await consume(response, (event) => setEvents((current) => [...current, event]));
      router.push(`/editor/${projectId}`);
    } catch (caught) {
      setError(errorMessage(caught));
      setEvents([]);
      setBusy(null);
    }
  }

  const over = prompt.trim().length > MAX_BRIEF_LENGTH;
  const working = busy !== null;
  const generating = busy === 'generate';

  // Leaving mid-generation drops the progress stream and the redirect to the
  // editor, so ask first. Browsers show their own wording for this prompt.
  useEffect(() => {
    if (!generating) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [generating]);

  return (
    <div className="relative">
      {/* A lit halo behind the composer, stronger while it is working. */}
      <div
        className={`pointer-events-none absolute -inset-px rounded-[22px] bg-gradient-to-r from-indigo-400/40 via-sky-300/30 to-fuchsia-400/30 blur-lg transition-opacity duration-700 ${
          generating ? 'animate-pulse opacity-90' : 'opacity-50'
        }`}
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#0c0c11]/95 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        {generating ? (
          // While it builds, the editing controls give way to what is being built.
          <div className="p-4 sm:p-5">
            <GenerationPanel events={events} brief={prompt.trim()} />
          </div>
        ) : (
          <>
          <div className="p-4 sm:p-5">
            <label htmlFor="brief" className="flex items-center gap-2 text-[13px] font-medium text-white/80">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-indigo-400 to-sky-400 text-[#07070a]">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              Describe the website you want
            </label>
            <textarea
              id="brief"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              disabled={working}
              autoFocus={Boolean(initialPrompt)}
              placeholder="Create a modern website for a photography business, with a portfolio gallery and a contact form..."
              className="mt-3 max-h-80 min-h-[7.5rem] w-full resize-none rounded-2xl [field-sizing:content] border border-white/10 bg-white/[0.03] px-4 py-3.5 text-[16px] leading-relaxed text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/25 focus:bg-white/[0.05] disabled:opacity-60"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) void create('generate');
              }}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLES.map((example, index) => (
                <button
                  key={example}
                  type="button"
                  disabled={working}
                  onClick={() => setPrompt(example)}
                  className={`focus-ring rounded-full border px-3 py-1.5 text-[12px] transition-colors disabled:opacity-40 ${
                    index >= 3 ? 'max-sm:hidden ' : ''
                  }${
                    prompt === example
                      ? 'border-white/40 bg-white/10 text-white'
                      : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white'
                  }`}
                >
                  {example}
                </button>
              ))}
            </div>

            {prompt.length > MAX_BRIEF_LENGTH / 4 ? (
              <p className={`mt-2 text-right text-[11px] tabular-nums ${over ? 'font-semibold text-red-400' : 'text-white/35'}`}>
                {prompt.length.toLocaleString()} / {MAX_BRIEF_LENGTH.toLocaleString()}
              </p>
            ) : null}

            {error ? (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-200">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] bg-white/[0.02] px-4 py-3 sm:px-5">
            <p className="text-[12px] text-white/40">
              Pages, sections, copy, imagery and a brand kit.{' '}
              <span className="hidden font-mono text-[11px] text-white/30 sm:inline">Ctrl + Enter</span>
            </p>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <button
                type="button"
                disabled={working}
                onClick={() => void create('blank')}
                className="focus-ring inline-flex h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/15 px-3 sm:px-4 text-[13px] font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40 sm:flex-none"
              >
                {busy === 'blank' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FilePlus2 className="h-3.5 w-3.5" />}
                Start blank
              </button>
              <button
                type="button"
                disabled={working || over}
                onClick={() => void create('generate')}
                className="focus-ring group inline-flex h-10 flex-[1.4] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-3 sm:px-5 text-[13px] font-semibold text-[#07070a] shadow-[0_0_30px_-6px_rgba(165,180,252,0.7)] transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Generate website
              </button>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Reads the progress stream and resolves with the new project's id.
 *
 * Server-sent events arrive as `data: {...}` blocks separated by a blank line,
 * and a chunk boundary can fall anywhere - including mid-event - so the tail of
 * the buffer is kept until its terminator turns up.
 */
async function consume(
  response: Response,
  onEvent: (event: GenerationProgress) => void,
): Promise<string> {
  if (!response.body) throw new Error('The server did not send a progress stream.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let projectId: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      const line = block.split('\n').find((candidate) => candidate.startsWith('data:'));
      if (!line) continue;

      let event: GenerationProgress;
      try {
        event = JSON.parse(line.slice(5).trim()) as GenerationProgress;
      } catch {
        continue;
      }

      // Failures arrive inside the stream, because the response has already begun.
      if (event.stage === 'error') throw new Error(event.message);
      onEvent(event);
      if (event.stage === 'done') projectId = event.projectId;
    }
  }

  if (!projectId) throw new Error('Generation ended without producing a website.');
  return projectId;
}
