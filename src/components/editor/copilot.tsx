'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Bot, Sparkles, User } from 'lucide-react';
import { Textarea } from '@/components/ui/field';
import { Spinner } from '@/components/ui/misc';
import { cn } from '@/lib/utils';
import { useEditor, useSelectedSection } from './store';
import { SECTION_META } from '@/lib/website/sections';

const SUGGESTIONS = [
  'Rewrite the hero copy to be sharper',
  'Add a pricing section after the features',
  'Use a darker, more premium design',
  'Make the whole site more conversion focused',
];

/**
 * Copilot chat.
 *
 * Sends the client's live document (so unsaved edits are respected) plus the
 * current selection. The server applies the model's operations and returns the
 * new document, which is swapped in as a single undoable step.
 */
export function Copilot({ send }: { send: (instruction: string) => Promise<void> }) {
  const messages = useEditor((state) => state.messages);
  const busy = useEditor((state) => state.copilotBusy);
  const selected = useSelectedSection();
  const [value, setValue] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, busy]);

  async function submit(instruction: string) {
    const text = instruction.trim();
    if (!text || busy) return;
    setValue('');
    await send(text);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-ink-200/70 px-3 py-2.5">
        <Sparkles className="h-3.5 w-3.5 text-brand-600" />
        <h2 className="text-[13px] font-semibold text-ink-900">AI Copilot</h2>
        {selected ? (
          <span className="ml-auto truncate rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
            {SECTION_META[selected.type].label} selected
          </span>
        ) : (
          <span className="ml-auto text-[10px] text-ink-400">whole site</span>
        )}
      </div>

      <div ref={listRef} className="studio-scroll flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-ink-200 bg-ink-50/60 p-3">
            <p className="text-[13px] font-medium text-ink-800">Tell me what to change.</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
              I edit by calling operations on the site structure - so changes are targeted and undoable.
            </p>
          </div>
        ) : null}

        {messages.map((message) => (
          <div key={message.id} className={cn('flex gap-2.5', message.role === 'USER' ? 'flex-row-reverse' : '')}>
            <span
              className={cn(
                'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md',
                message.role === 'USER' ? 'bg-ink-900 text-white' : 'bg-brand-100 text-brand-700',
              )}
            >
              {message.role === 'USER' ? <User className="h-3 w-3" /> : <Bot className="h-3.5 w-3.5" />}
            </span>
            <div
              className={cn(
                'max-w-[86%] rounded-xl px-3 py-2 text-[13px] leading-relaxed',
                message.role === 'USER' ? 'bg-ink-900 text-white' : 'bg-white text-ink-700 ring-1 ring-ink-200',
                message.failed && 'ring-red-200',
              )}
            >
              {message.pending ? (
                <span className="flex items-center gap-2 text-ink-500">
                  <Spinner /> Thinking…
                </span>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-ink-200/70 p-2.5">
        {messages.length === 0 ? (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void submit(suggestion)}
                disabled={busy}
                className="rounded-full border border-ink-200 bg-white px-2 py-1 text-[11px] text-ink-600 hover:border-brand-300 hover:text-brand-700 disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        <form
          className="relative"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(value);
          }}
        >
          <Textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={3}
            disabled={busy}
            placeholder={selected ? `Edit the selected ${selected.type} section...` : 'Ask for a change...'}
            className="pr-11 text-[13px]"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void submit(value);
              }
            }}
          />
          <button
            type="submit"
            disabled={busy || value.trim().length === 0}
            aria-label="Send"
            className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-lg bg-ink-900 text-white transition-colors hover:bg-ink-800 disabled:bg-ink-300"
          >
            {busy ? <Spinner className="text-white" /> : <ArrowUp className="h-3.5 w-3.5" />}
          </button>
        </form>
        <p className="mt-1.5 px-1 text-[10px] text-ink-400">Enter to send · Shift+Enter for a new line</p>
      </div>
    </div>
  );
}
