import { NextResponse } from 'next/server';
import { handle } from '@/lib/api';
import { requireUser, requireWorkspace } from '@/lib/tenancy';
import { resolveCredentials } from '@/lib/deploy/credentials';
import { listProjects } from '@/lib/deploy/vercel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The connected account's Vercel projects, for the mapping UI.
 *
 * Paginated rather than returned whole: Vercel pages projects by timestamp, and
 * an account with more projects than one page would otherwise silently hide the
 * one someone is looking for. `until` is the cursor from the previous response.
 */
export const GET = handle(async (request: Request) => {
  const user = await requireUser();
  const workspace = await requireWorkspace(user.id);

  const resolved = await resolveCredentials(workspace.id);
  if (!resolved) {
    return NextResponse.json(
      { error: 'No Vercel account is connected.', projects: [], next: null },
      { status: 400 },
    );
  }

  const url = new URL(request.url);
  const rawUntil = Number(url.searchParams.get('until'));
  const until = Number.isFinite(rawUntil) && rawUntil > 0 ? rawUntil : undefined;

  const page = await listProjects(resolved.credentials, { limit: 20, until });
  return NextResponse.json({ ...page, accountName: resolved.accountName });
});
