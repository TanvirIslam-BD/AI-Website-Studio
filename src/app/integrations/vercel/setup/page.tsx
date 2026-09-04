import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { currentUser, requireWorkspace } from '@/lib/tenancy';
import { PENDING_COOKIE, decodePending } from '@/lib/deploy/oauth';
import { IntegrationShell } from '@/components/integrations/shell';
import { SetupClient } from './setup-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Connect Vercel',
  robots: { index: false, follow: false },
};

/**
 * Where an install that started on Vercel finishes.
 *
 * Reached only from the OAuth callback, which banks the authorization code in
 * an httpOnly cookie rather than connecting straight away. Landing here without
 * that cookie means the install expired or someone opened the URL directly, so
 * there is nothing to confirm.
 */
export default async function VercelSetupPage() {
  const user = await currentUser();
  if (!user) redirect('/signin?next=/integrations/vercel/setup');

  const jar = await cookies();
  const pending = decodePending(jar.get(PENDING_COOKIE)?.value);
  if (!pending) redirect('/dashboard?vercel=expired');

  const workspace = await requireWorkspace(user.id);

  return (
    <IntegrationShell>
      <SetupClient workspaceName={workspace.name} />
    </IntegrationShell>
  );
}
