'use client';

import { useState } from 'react';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/field';
import { errorMessage } from '@/lib/utils';
import type { GenerationMode, PlatformSettings } from '@/lib/platform/settings';

/**
 * The generation levers.
 *
 * Each control saves on its own rather than through a form with a Save button:
 * these exist to stop something quickly, and a pause that needs a second click
 * to take effect is a pause that arrives late.
 */

const MODES: { value: GenerationMode; label: string; detail: string }[] = [
  { value: 'auto', label: 'Automatic', detail: 'Use whatever the environment configures' },
  { value: 'ai', label: 'Force AI', detail: 'Always call the model' },
  { value: 'template', label: 'Force templates', detail: 'Never call the model' },
];

export function GenerationControls({ initial, provider }: { initial: PlatformSettings; provider: string }) {
  const [settings, setSettings] = useState(initial);
  const [notice, setNotice] = useState(initial.notice ?? '');
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(patch: Partial<PlatformSettings>, key: string) {
    setBusy(key);
    setError(null);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const payload = (await response.json()) as PlatformSettings & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Could not save that.');
      setSettings(payload);
      setNotice(payload.notice ?? '');
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">Mode</p>
        <span className="flex items-center gap-1.5 text-[11px] text-ink-400">
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          {saved ? (
            <>
              <Check className="h-3 w-3 text-emerald-600" /> Saved
            </>
          ) : null}
        </span>
      </div>

      <div className="mt-2.5 grid gap-1.5">
        {MODES.map((mode) => {
          const active = settings.generationMode === mode.value;
          return (
            <button
              key={mode.value}
              type="button"
              disabled={busy !== null}
              onClick={() => void save({ generationMode: mode.value }, mode.value)}
              className={`focus-ring flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors disabled:opacity-60 ${
                active ? 'border-ink-900 bg-ink-950 text-white' : 'border-ink-200 bg-white hover:border-ink-300'
              }`}
            >
              <span>
                <span className="block text-[13px] font-medium">{mode.label}</span>
                <span className={`block text-[11px] ${active ? 'text-white/60' : 'text-ink-500'}`}>{mode.detail}</span>
              </span>
              {active ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 text-[11px] text-ink-400">
        Provider: <span className="font-mono">{provider}</span>
      </p>

      <div className="mt-4 grid gap-2 border-t border-ink-100 pt-3.5">
        <Toggle
          label="Pause generation"
          detail="Refuses new generations and AI edits, everywhere."
          on={settings.generationPaused}
          busy={busy === 'pause'}
          onChange={(value) => void save({ generationPaused: value }, 'pause')}
        />
        <Toggle
          label="Pause signups"
          detail="Existing users are unaffected."
          on={settings.signupsPaused}
          busy={busy === 'signups'}
          onChange={(value) => void save({ signupsPaused: value }, 'signups')}
        />
      </div>

      <div className="mt-4 border-t border-ink-100 pt-3.5">
        {/*
          A line shown to every signed-in user. Paired with the pause above:
          stopping something without saying why produces a support queue, and
          this is the cheapest way to answer it once instead of individually.
        */}
        <label htmlFor="platform-notice" className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
          Notice
        </label>
        <Textarea
          id="platform-notice"
          rows={2}
          maxLength={280}
          value={notice}
          onChange={(event) => setNotice(event.target.value)}
          placeholder="Shown to every signed-in user while set. Leave empty for none."
          className="mt-1.5 text-[13px]"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[11px] text-ink-400">{notice.length}/280</span>
          <Button
            variant="secondary"
            size="sm"
            loading={busy === 'notice'}
            disabled={notice.trim() === (settings.notice ?? '').trim()}
            onClick={() => void save({ notice: notice.trim() || null }, 'notice')}
          >
            Save notice
          </Button>
        </div>
      </div>

      {error ? (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-2.5 py-2 text-[12px] text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      ) : null}
    </div>
  );
}

function Toggle({
  label,
  detail,
  on,
  busy,
  onChange,
}: {
  label: string;
  detail: string;
  on: boolean;
  busy: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="min-w-0">
        <span className="block text-[13px] text-ink-800">{label}</span>
        <span className="block text-[11px] text-ink-500">{detail}</span>
      </span>
      <Button
        variant={on ? 'primary' : 'secondary'}
        size="sm"
        loading={busy}
        onClick={() => onChange(!on)}
        aria-pressed={on}
      >
        {on ? 'Paused' : 'Running'}
      </Button>
    </div>
  );
}
