'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, FileCode2, Loader2, Rocket, RotateCw, X } from 'lucide-react';
import type { DeploymentStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { DeploymentStatusBadge } from '@/components/ui/misc';
import { errorMessage, formatBytes, formatRelative } from '@/lib/utils';

export type DeploymentView = {
  id: string;
  status: DeploymentStatus;
  url: string | null;
  inspectorUrl: string | null;
  error: string | null;
  fileCount: number | null;
  sizeKb: number | null;
  createdAt: string;
  readyAt: string | null;
};

type TokenCheck = { usable: boolean; scope: string | null; reason: string | null };

type DeployState = {
  configured: boolean;
  token?: TokenCheck;
  deployment: DeploymentView | null;
  history: DeploymentView[];
  files: Array<{ file: string; bytes: number }>;
};

const POLL_INTERVAL = 2500;
const LIVE_STATES: DeploymentStatus[] = ['QUEUED', 'BUILDING'];

/**
 * Deployment panel.
 *
 * Shows exactly what would be shipped, starts a deployment, then polls until
 * the build settles. Polling rather than a webhook keeps the studio deployable
 * anywhere, with no inbound URL to configure.
 */
export function DeployPanel({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [state, setState] = useState<DeployState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/deploy`, { cache: 'no-store' });
      const payload = (await response.json()) as DeployState & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Could not read deployment status.');
      setState(payload);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }, [projectId]);

  useEffect(() => {
    void load();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [load]);

  const status = state?.deployment?.status;
  useEffect(() => {
    if (!status || !LIVE_STATES.includes(status)) return;
    timer.current = setTimeout(() => void load(), POLL_INTERVAL);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [status, load]);

  async function deploy() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/deploy`, { method: 'POST' });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Could not start the deployment.');
      await load();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  const deployment = state?.deployment ?? null;
  const live = deployment ? LIVE_STATES.includes(deployment.status) : false;
  const totalBytes = state?.files.reduce((sum, file) => sum + file.bytes, 0) ?? 0;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/40 p-4" role="dialog" aria-modal>
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-pop">
        <div className="flex items-center gap-2.5 border-b border-ink-200/70 px-4 py-3">
          <Rocket className="h-4 w-4 text-ink-500" />
          <h2 className="text-sm font-semibold text-ink-900">Deploy to Vercel</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="studio-scroll flex-1 overflow-y-auto p-4">
          {!state ? (
            <div className="grid place-items-center py-10 text-ink-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4">
              {!state.configured ? <NotConfigured /> : null}
              {state.configured && state.token && !state.token.usable ? (
                <TokenProblem reason={state.token.reason} />
              ) : null}
              {deployment ? <DeploymentCard deployment={deployment} live={live} /> : null}

              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                  <FileCode2 className="h-3.5 w-3.5" /> Files to ship ({state.files.length} · {formatBytes(totalBytes)})
                </p>
                <ul className="divide-y divide-ink-100 overflow-hidden rounded-lg border border-ink-200">
                  {state.files.map((file) => (
                    <li key={file.file} className="flex items-center justify-between px-3 py-1.5 text-[12px]">
                      <span className="font-mono text-ink-700">{file.file}</span>
                      <span className="text-ink-400">{formatBytes(file.bytes)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] leading-relaxed text-ink-400">
                  Static HTML and CSS only. No server code is generated, and the deployed site needs no runtime.
                </p>
              </div>

              <History history={state.history} />
              {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p> : null}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-ink-200/70 bg-ink-50/60 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => void load()}>
            <RotateCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={busy || live}
            disabled={!state?.configured || live}
            onClick={() => void deploy()}
          >
            <Rocket className="h-3.5 w-3.5" />
            {live ? 'Deploying…' : deployment?.status === 'READY' ? 'Redeploy' : 'Deploy to production'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-amber-900">
        <AlertCircle className="h-3.5 w-3.5" /> Vercel is not configured
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-amber-800">
        Add <code className="rounded bg-white/70 px-1">VERCEL_TOKEN</code> to your environment (plus{' '}
        <code className="rounded bg-white/70 px-1">VERCEL_TEAM_ID</code> for team accounts), then restart the server.
      </p>
    </div>
  );
}

/** A token that cannot create projects, surfaced before a failed deployment. */
function TokenProblem({ reason }: { reason: string | null }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-amber-900">
        <AlertCircle className="h-3.5 w-3.5" /> This token may not be able to deploy
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-amber-800">
        {reason ?? 'The token was rejected by Vercel.'}
      </p>
      <p className="mt-1.5 text-[12px] text-amber-800">You can still try - this check is advisory.</p>
      <a
        href="https://vercel.com/account/tokens"
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-amber-900 underline underline-offset-2"
      >
        Create a token <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function DeploymentCard({ deployment, live }: { deployment: DeploymentView; live: boolean }) {
  return (
    <div className="rounded-xl border border-ink-200 p-3">
      <div className="flex items-center gap-2">
        <DeploymentStatusBadge status={deployment.status} />
        <span className="text-[11px] text-ink-400">{formatRelative(deployment.createdAt)}</span>
        {live ? <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-ink-400" /> : null}
      </div>

      {deployment.status === 'READY' && deployment.url ? (
        <a
          href={deployment.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-[13px] font-medium text-emerald-800 hover:bg-emerald-100"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{deployment.url.replace('https://', '')}</span>
          <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0" />
        </a>
      ) : null}

      {live ? (
        <p className="mt-2 text-[12px] text-ink-500">
          {deployment.status === 'QUEUED' ? 'Queued at Vercel…' : 'Building…'} this normally takes under a minute.
        </p>
      ) : null}

      {deployment.error ? (
        <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-2 text-[12px] leading-relaxed text-red-700">
          {deployment.error}
        </p>
      ) : null}

      {deployment.inspectorUrl ? (
        <a
          href={deployment.inspectorUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[12px] text-ink-500 hover:text-ink-800"
        >
          Build logs on Vercel <ExternalLink className="h-3 w-3" />
        </a>
      ) : null}
    </div>
  );
}

function History({ history }: { history: DeploymentView[] }) {
  if (history.length <= 1) return null;
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-500">History</p>
      <ul className="grid gap-1">
        {history.slice(1).map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-[12px] text-ink-500">
            <DeploymentStatusBadge status={item.status} />
            <span>{formatRelative(item.createdAt)}</span>
            {item.url ? (
              <a href={item.url} target="_blank" rel="noreferrer" className="ml-auto truncate hover:text-ink-800">
                {item.url.replace('https://', '')}
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
