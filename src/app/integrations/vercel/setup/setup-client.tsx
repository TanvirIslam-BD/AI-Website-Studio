'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteProjectMapper } from '@/components/integrations/site-project-mapper';
import { errorMessage } from '@/lib/utils';

/**
 * Finishing an install that started on Vercel.
 *
 * Vercel opens this in a popup, so the screen has one job and no navigation:
 * confirm the account, map the sites, close. Two details are deliberate.
 *
 * The connection is not made until Confirm is pressed. Because the install did
 * not start here, there is no `state` to prove the person meant to attach this
 * account to their workspace, and a link carrying someone else's code would
 * otherwise repoint their sites silently. Pressing the button is the proof.
 *
 * Finishing follows Vercel's `next`, which is what closes the popup. The old
 * behaviour of redirecting to our own dashboard left the popup sitting open
 * over the Vercel tab that opened it.
 */
export function SetupClient({ workspaceName }: { workspaceName: string }) {
  const [stage, setStage] = useState<'confirm' | 'map'>('confirm');
  const [account, setAccount] = useState<string | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/integrations/vercel/complete', { method: 'POST' });
      const payload = (await response.json()) as { accountName?: string | null; next?: string | null; error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Could not finish connecting that account.');
      setAccount(payload.accountName ?? null);
      setNext(payload.next ?? null);
      setStage('map');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    try {
      await fetch('/api/integrations/vercel/complete', { method: 'DELETE' });
    } finally {
      window.location.href = '/dashboard';
    }
  }

  function finish() {
    // `next` closes the popup Vercel opened. Without one this was a normal tab,
    // so the dashboard is where they should end up.
    window.location.href = next ?? '/dashboard';
  }

  if (stage === 'confirm') {
    return (
      <div className="grid gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-[-0.01em] text-ink-900">Connect your Vercel account</h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">
            You are about to connect the Vercel account you just approved to{' '}
            <strong className="font-semibold text-ink-900">{workspaceName}</strong>. Websites you publish will be
            created as projects in that account, so their domains, analytics and settings stay yours.
          </p>
        </div>

        {error ? (
          <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="md" loading={busy} onClick={() => void confirm()}>
            Connect to {workspaceName}
          </Button>
          <Button variant="ghost" size="md" disabled={busy} onClick={() => void cancel()}>
            Cancel
          </Button>
        </div>

        <p className="text-[11px] leading-relaxed text-ink-400">
          Nothing is stored until you confirm. The credential is encrypted before it is saved and never shown back —
          you will only ever see the account name and four characters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div>
        <p className="flex items-center gap-2 text-[13px] font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Connected{account ? ` to ${account}` : ''}
        </p>
        <h1 className="mt-2 text-lg font-bold tracking-[-0.01em] text-ink-900">Choose where each site publishes</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">
          Each website can create its own Vercel project, or publish into one that already exists in your account. You
          can change this at any time from the integration&rsquo;s Configure screen.
        </p>
      </div>

      <SiteProjectMapper />

      <div className="flex items-center gap-2 border-t border-ink-200 pt-3">
        <Button variant="primary" size="md" onClick={finish}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Done
        </Button>
        <p className="text-[11px] text-ink-400">Choices save as you make them.</p>
      </div>
    </div>
  );
}
