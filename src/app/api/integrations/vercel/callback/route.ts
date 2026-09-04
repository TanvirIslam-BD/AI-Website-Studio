import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { currentUser, requireWorkspace } from '@/lib/tenancy';
import {
  PENDING_COOKIE,
  RETURN_COOKIE,
  STATE_COOKIE,
  encodePending,
  exchangeCode,
  integrationConfig,
  safeVercelNext,
} from '@/lib/deploy/oauth';
import { connectWorkspaceFromOAuth } from '@/lib/deploy/credentials';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Completes a Vercel install.
 *
 * Two different journeys land here, and they need different endings:
 *
 *  - **Started in this app**, from the deploy dialog's "Continue with Vercel".
 *    We sent the user out, so we hold a `state` cookie to check, and we know
 *    which screen they left. Connect and send them back to it.
 *
 *  - **Started on Vercel**, from the Install button on the marketplace listing.
 *    Vercel opened a popup and there is no `state`, because we never issued
 *    one. Requiring it here rejected every marketplace install; following our
 *    own return path instead of Vercel's `next` left the popup open forever.
 *
 * The second case does not connect anything yet. Without a `state` there is
 * nothing to show the person meant to attach this particular Vercel account to
 * their workspace, so the code is banked in an httpOnly cookie and the setup
 * screen asks them - which is also where they map their sites onto projects,
 * as the integration review guidelines require.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const jar = await cookies();

  const returnTo = jar.get(RETURN_COOKIE)?.value ?? '/dashboard';
  const expected = jar.get(STATE_COOKIE)?.value;
  const next = safeVercelNext(url.searchParams.get('next'));

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
    if (!user) {
      // Someone installing from the marketplace may have no session here yet.
      // Send them to sign in and come back to the same callback with the code
      // intact, rather than dropping them on a 401 mid-install.
      const signin = new URL('/signin', url.origin);
      signin.searchParams.set('next', `${url.pathname}${url.search}`);
      return NextResponse.redirect(signin);
    }

    const config = integrationConfig();
    if (!config) return fail('Vercel OAuth is not configured on this server.');

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code) return fail('Vercel did not return an authorization code.');

    // --- Started on Vercel: confirm before connecting ----------------------
    if (!expected) {
      jar.set(PENDING_COOKIE, encodePending({
        code,
        configurationId: url.searchParams.get('configurationId'),
        teamId: url.searchParams.get('teamId'),
        next,
      }), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 900,
        path: '/',
      });
      return NextResponse.redirect(new URL('/integrations/vercel/setup', url.origin));
    }

    // --- Started here: the state cookie is the proof ----------------------
    if (!state || state !== expected) {
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
      configurationId: url.searchParams.get('configurationId') ?? exchanged.installationId,
    });

    clear();

    // They came from the deploy dialog; send them back to it. Vercel's `next`
    // exists to close a popup this journey never opened.
    const target = new URL(returnTo, url.origin);
    target.searchParams.set('vercel', 'connected');
    return NextResponse.redirect(target);
  } catch (error) {
    console.error('[vercel-oauth]', error);
    return fail(error instanceof Error ? error.message : 'The Vercel connection failed.');
  }
}
