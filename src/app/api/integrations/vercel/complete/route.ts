import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { handle } from '@/lib/api';
import { requireUser, requireWorkspace } from '@/lib/tenancy';
import { PENDING_COOKIE, decodePending, exchangeCode, integrationConfig } from '@/lib/deploy/oauth';
import { connectWorkspaceFromOAuth } from '@/lib/deploy/credentials';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Confirms a Vercel-initiated install.
 *
 * POST rather than GET, and driven by the httpOnly cookie the callback set:
 * this is the step where the user says yes, so it must not be reachable by
 * following a link. The authorization code is spent here and nowhere else, and
 * it never passes through the page.
 */
export const POST = handle(async (request: Request) => {
  const user = await requireUser();
  const jar = await cookies();

  const pending = decodePending(jar.get(PENDING_COOKIE)?.value);
  if (!pending) {
    throw new Error('That install has expired. Start it again from Vercel.');
  }

  const config = integrationConfig();
  if (!config) throw new Error('Vercel OAuth is not configured on this server.');

  const origin = new URL(request.url).origin;
  const exchanged = await exchangeCode({
    code: pending.code,
    redirectUri: `${origin}/api/integrations/vercel/callback`,
    config,
  });

  const workspace = await requireWorkspace(user.id);
  const status = await connectWorkspaceFromOAuth({
    workspaceId: workspace.id,
    userId: user.id,
    token: exchanged.accessToken,
    teamId: exchanged.teamId ?? pending.teamId,
    configurationId: pending.configurationId ?? exchanged.installationId,
  });

  // The code is single-use and now spent, so the envelope must not linger.
  jar.set(PENDING_COOKIE, '', { maxAge: 0, path: '/' });

  return NextResponse.json({ ...status, next: pending.next });
});

/** Abandoning the install: drop the banked code rather than leave it sitting. */
export const DELETE = handle(async () => {
  await requireUser();
  const jar = await cookies();
  jar.set(PENDING_COOKIE, '', { maxAge: 0, path: '/' });
  return NextResponse.json({ ok: true });
});
