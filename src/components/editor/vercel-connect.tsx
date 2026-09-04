'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Link2, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { errorMessage } from '@/lib/utils';

export type ConnectionStatus = {
  connected: boolean;
  source: 'workspace' | 'platform' | null;
  accountName: string | null;
  tokenHint: string | null;
  teamId: string | null;
  canConnect: boolean;
  oauthAvailable: boolean;
  method: 'oauth' | 'token' | null;
};

/**
 * Reads the outcome the OAuth callback left in the URL, then removes it so a
 * refresh does not show a stale message.
 */
function useOAuthOutcome() {
  const [outcome, setOutcome] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('vercel');
    if (!result) return;

    setOutcome(
      result === 'connected'
        ? { ok: true, message: 'Your Vercel account is connected.' }
        : { ok: false, message: params.get('reason') ?? 'The Vercel connection failed.' },
    );

    params.delete('vercel');
    params.delete('reason');
    const query = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
  }, []);

  return outcome;
}

/**
 * Connecting a workspace's own Vercel account.
 *
 * Lives in the deploy dialog rather than a separate settings page, because
 * this is exactly the moment someone needs it.
 *
 * Signing in with Vercel is the only path most people should ever see: they
 * click once, approve on vercel.com, and come back connected. Pasting an
 * access token is kept as a fallback for self-hosted installs that have no
 * integration registered, and stays collapsed so it never reads as the
 * expected route.
 */
export function VercelConnect({
  status,
  onChange,
}: {
  status: ConnectionStatus;
  onChange: () => void;
}) {
  const outcome = useOAuthOutcome();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState('');
  const [teamId, setTeamId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function signIn() {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/api/integrations/vercel/connect?returnTo=${encodeURIComponent(returnTo)}`;
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/workspace/vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), teamId: teamId.trim() || undefined }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Could not connect that account.');
      setToken('');
      setTeamId('');
      setOpen(false);
      onChange();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    if (!window.confirm('Disconnect this Vercel account? Sites already deployed stay live in that account.')) return;
    setBusy(true);
    try {
      await fetch('/api/workspace/vercel', { method: 'DELETE' });
      onChange();
    } finally {
      setBusy(false);
    }
  }

  if (status.source === 'workspace') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-emerald-900">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Deploying to {status.accountName ? `“${status.accountName}”` : 'your Vercel account'}
        </p>
        <p className="mt-1 text-[12px] text-emerald-800">
          {status.method === 'oauth' ? 'Signed in with Vercel' : `Access token ${status.tokenHint ?? ''}`}
          {status.teamId ? ` · team ${status.teamId}` : ' · personal account'}. You own the project, so domains and
          analytics are yours to manage.
        </p>
        <Button variant="ghost" size="sm" className="mt-2 text-emerald-900" loading={busy} onClick={() => void disconnect()}>
          <Unlink className="h-3.5 w-3.5" /> Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ink-200 bg-ink-50 p-3">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900">
        <Link2 className="h-3.5 w-3.5" /> Connect your Vercel account
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-ink-600">
        {status.source === 'platform'
          ? 'This site would deploy to the platform account. Connect your own so the project, its domain and its analytics belong to you.'
          : 'Deploy to an account you control, so the project, its domain and its analytics belong to you.'}
      </p>

      {outcome && !outcome.ok ? (
        <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-2 text-[12px] leading-relaxed text-red-700">{outcome.message}</p>
      ) : null}

      {!status.canConnect ? (
        <p className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 px-2.5 py-2 text-[12px] text-amber-900">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          The server has no ENCRYPTION_KEY set, so credentials cannot be stored securely yet.
        </p>
      ) : (
        <>
          {status.oauthAvailable ? (
            <div className="mt-2.5">
              <Button variant="primary" size="sm" onClick={signIn}>
                <VercelMark /> Continue with Vercel
              </Button>
              <p className="mt-1.5 text-[11px] text-ink-500">
                You&rsquo;ll sign in on vercel.com and come straight back. No account yet?{' '}
                <a
                  href="https://vercel.com/signup"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline decoration-ink-300 underline-offset-2 hover:text-ink-900"
                >
                  It&rsquo;s free <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          ) : null}

          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-2 text-[11px] text-ink-500 underline decoration-ink-300 underline-offset-2 hover:text-ink-900"
            >
              {status.oauthAvailable ? 'Use an access token instead' : 'Connect with an access token'}
            </button>
          ) : (
            <form
              className="mt-3 grid gap-2 border-t border-ink-200 pt-3"
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              <label className="grid gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Access token</span>
                <Input
                  autoFocus
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="vercel_..."
                  className="font-mono text-[12px]"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  Team ID <span className="font-normal normal-case text-ink-400">— only for team accounts</span>
                </span>
                <Input
                  value={teamId}
                  onChange={(event) => setTeamId(event.target.value)}
                  placeholder="team_..."
                  className="font-mono text-[12px]"
                />
              </label>

              <a
                href="https://vercel.com/account/tokens"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[12px] text-ink-600 hover:text-ink-900"
              >
                Create a token with account scope <ExternalLink className="h-3 w-3" />
              </a>

              {error ? (
                <p className="rounded-lg bg-red-50 px-2.5 py-2 text-[12px] leading-relaxed text-red-700">{error}</p>
              ) : null}

              <div className="mt-1 flex gap-2">
                <Button type="submit" variant="primary" size="sm" loading={busy} disabled={token.trim().length < 10}>
                  Verify and connect
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

/** Vercel's triangle, so the button is recognisable before the label is read. */
function VercelMark() {
  return (
    <svg viewBox="0 0 76 65" aria-hidden className="h-3 w-3" fill="currentColor">
      <path d="M37.53 0 75.06 65H0z" />
    </svg>
  );
}
