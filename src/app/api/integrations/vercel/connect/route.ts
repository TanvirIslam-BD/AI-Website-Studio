import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { currentUser } from '@/lib/tenancy';
import { RETURN_COOKIE, STATE_COOKIE, installUrl, integrationConfig } from '@/lib/deploy/oauth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Starts the Vercel install.
 *
 * A random `state` is stored in an httpOnly cookie and echoed back by Vercel,
 * so the callback can prove the response belongs to a flow this browser began
 * rather than one an attacker triggered.
 */
export async function GET(request: Request) {
  // currentUser rather than requireUser: an expired session should land on
  // the sign-in page, not a 401 from a link the user clicked.
  if (!(await currentUser())) return NextResponse.redirect(new URL('/signin', request.url));

  const config = integrationConfig();
  if (!config) {
    return NextResponse.json(
      { error: 'Vercel OAuth is not configured on this server. Connect with an access token instead.' },
      { status: 400 },
    );
  }

  // Where to send the user once the install finishes - usually the editor they
  // started from, so they land back on the deploy dialog.
  const requested = new URL(request.url).searchParams.get('returnTo') ?? '/dashboard';
  // Path-only, and not protocol-relative - browsers read "//host" as an
  // absolute URL, which would turn this into an open redirect.
  const returnTo = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/dashboard';

  const state = crypto.randomBytes(24).toString('base64url');
  const jar = await cookies();
  const options = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' };

  jar.set(STATE_COOKIE, state, options);
  jar.set(RETURN_COOKIE, returnTo, options);

  return NextResponse.redirect(installUrl(config.slug, state));
}
