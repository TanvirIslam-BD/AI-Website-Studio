import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { currentUser, requireWorkspace } from '@/lib/tenancy';
import { RETURN_COOKIE, STATE_COOKIE, exchangeCode, integrationConfig } from '@/lib/deploy/oauth';
import { connectWorkspaceFromOAuth } from '@/lib/deploy/credentials';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Completes the Vercel install.
 *
 * Vercel returns `code`, `configurationId`, an optional `teamId`, the `state`
 * we sent, and `next` - a URL that closes the install popup. The code is
 * single-use and expires in 30 minutes, so any failure here means starting the
 * install again rather than retrying.
 *
 * Errors are reported by redirecting back with a message rather than rendering
 * raw JSON, because the person at the other end clicked a button and expects
 * to end up somewhere sensible.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const jar = await cookies();

  const returnTo = jar.get(RETURN_COOKIE)?.value ?? '/dashboard';
  const clear = () => {
    jar.set(STATE_COOKIE, '', { maxAge: 0, path: '/' });
    jar.set(RETURN_COOKIE, '', { maxAge: 0, path: '/' });
  };

  const fail = (reason: string) => {
    clear();
    const target = new URL(returnTo, url.origin);
    target.searchParams.set('vercel', 'error');
    target.searchParams.set('reason', reason);
    return NextResponse.redirect(target);
  };

  try {
    const user = await currentUser();
    if (!user) return NextResponse.redirect(new URL('/signin', url.origin));

    const config = integrationConfig();
    if (!config) return fail('Vercel OAuth is not configured on this server.');

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const expected = jar.get(STATE_COOKIE)?.value;

    if (!code) return fail('Vercel did not return an authorization code.');
    if (!expected || !state || state !== expected) {
      return fail('That connection attempt could not be verified. Please try again.');
    }

    const exchanged = await exchangeCode({
      code,
      // Must match the Redirect URL registered on the integration exactly.
      redirectUri: `${url.origin}/api/integrations/vercel/callback`,
      config,
    });

    const workspace = await requireWorkspace(user.id);
    await connectWorkspaceFromOAuth({
      workspaceId: workspace.id,
      userId: user.id,
      token: exchanged.accessToken,
      teamId: exchanged.teamId,
      configurationId: url.searchParams.get('configurationId'),
    });

    clear();

    // Vercel also sends `next`, which exists to close the popup that its own
    // marketplace flow opens. This install was a top-level navigation we
    // started ourselves, so following it would strand the user on
    // vercel.com. They came from the deploy dialog; send them back to it.
    const target = new URL(returnTo, url.origin);
    target.searchParams.set('vercel', 'connected');
    return NextResponse.redirect(target);
  } catch (error) {
    console.error('[vercel-oauth]', error);
    return fail(error instanceof Error ? error.message : 'The Vercel connection failed.');
  }
}
