import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { AlertCircle } from 'lucide-react';
import { currentUser, requireWorkspace } from '@/lib/tenancy';
import { connectionStatus, workspaceForConfiguration } from '@/lib/deploy/credentials';
import { IntegrationShell } from '@/components/integrations/shell';
import { SiteProjectMapper } from '@/components/integrations/site-project-mapper';
import { ConfigureActions } from './configure-actions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Configure Vercel',
  robots: { index: false, follow: false },
};

type Search = { searchParams: Promise<{ configurationId?: string; teamId?: string }> };

/**
 * The Configuration URL registered on the integration.
 *
 * Vercel's Configure button sends the user here with a `configurationId` and
 * nothing else, so that id is the only handle on which install is being
 * configured. It is resolved against the signed-in user's own memberships -
 * an id belonging to someone else simply does not resolve, so a guessed one
 * reveals nothing.
 *
 * Someone may also arrive with no id at all, by opening the URL directly. That
 * is not an error worth blocking on: fall back to their current workspace,
 * which is the install they would have been configuring anyway.
 */
export default async function VercelConfigurePage({ searchParams }: Search) {
  const { configurationId } = await searchParams;

  const user = await currentUser();
  if (!user) {
    const target = configurationId
      ? `/integrations/vercel/configure?configurationId=${encodeURIComponent(configurationId)}`
      : '/integrations/vercel/configure';
    redirect(`/signin?next=${encodeURIComponent(target)}`);
  }

  const matched = configurationId ? await workspaceForConfiguration(configurationId, user.id) : null;
  const workspace = matched ? { id: matched.workspaceId } : await requireWorkspace(user.id);
  const status = await connectionStatus(workspace.id);

  return (
    <IntegrationShell>
      <div className="grid gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-[-0.01em] text-ink-900">Vercel integration</h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">
            {status.connected && status.source === 'workspace' ? (
              <>
                Publishing to{' '}
                <strong className="font-semibold text-ink-900">{status.accountName ?? 'your Vercel account'}</strong>
                {status.teamId ? ' (team)' : ' (personal account)'}
                {status.method === 'oauth' ? ', connected by signing in' : `, using token ${status.tokenHint ?? ''}`}.
              </>
            ) : (
              'No Vercel account is connected to this workspace yet.'
            )}
          </p>
        </div>

        {configurationId && !matched ? (
          <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-900">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            That install is not linked to any workspace you belong to, so these settings are for your current workspace
            instead.
          </p>
        ) : null}

        {status.connected && status.source === 'workspace' ? (
          <>
            <div>
              <h2 className="text-[13px] font-semibold text-ink-900">Where each site publishes</h2>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-600">
                Map a website onto a Vercel project that already exists, or let it create its own.
              </p>
              <div className="mt-2.5">
                <SiteProjectMapper compact />
              </div>
            </div>
            <ConfigureActions />
          </>
        ) : (
          <p className="rounded-xl border border-ink-200 bg-ink-50 px-3 py-3 text-[12px] leading-relaxed text-ink-600">
            Open a website in the editor and choose <strong className="font-semibold text-ink-900">Deploy</strong> to
            connect an account.
          </p>
        )}
      </div>
    </IntegrationShell>
  );
}
