import { VercelError } from './vercel';

/**
 * Connecting a Vercel account by OAuth rather than a pasted token.
 *
 * Uses Vercel's Integration flow, which is the one that can actually create
 * projects and deployments on a user's behalf today. (The newer "Sign in with
 * Vercel" OAuth apps issue identity tokens; their API permissions are still in
 * private beta, so they cannot deploy.)
 *
 * Nobody has to know what an access token is: they click a button, choose
 * their account or team on Vercel, approve, and come back connected.
 */

const TOKEN_ENDPOINT = 'https://api.vercel.com/v2/oauth/access_token';

/**
 * Short-lived cookies that carry the flow across the trip to vercel.com:
 * `state` proves the callback answers a request this browser made, and
 * `return` remembers which screen to come back to.
 */
export const STATE_COOKIE = 'vercel_oauth_state';
export const RETURN_COOKIE = 'vercel_oauth_return';

/**
 * Holds a Vercel-initiated install between the callback and the setup screen.
 *
 * When someone installs from the Vercel Marketplace, we did not start the flow,
 * so there is no `state` to check and nothing proving the person in front of
 * the browser meant to attach *this* Vercel account to *their* workspace. A
 * link carrying someone else's `code` would otherwise silently repoint their
 * sites at an account they do not own.
 *
 * So the callback banks the exchange instead of performing it: the code is put
 * in this short-lived httpOnly cookie, the user is shown which account they are
 * about to connect, and the exchange only happens when they confirm. The code
 * never reaches the page, and the confirmation is what authorises the link.
 */
export const PENDING_COOKIE = 'vercel_oauth_pending';

export type PendingInstall = {
  code: string;
  configurationId: string | null;
  teamId: string | null;
  /** Vercel's own URL for closing the install popup. */
  next: string | null;
};

/** Cookies are a flat string, so the envelope is JSON in base64url. */
export function encodePending(pending: PendingInstall): string {
  return Buffer.from(JSON.stringify(pending), 'utf8').toString('base64url');
}

export function decodePending(value: string | undefined): PendingInstall | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Partial<PendingInstall>;
    if (typeof parsed.code !== 'string' || !parsed.code) return null;
    return {
      code: parsed.code,
      configurationId: typeof parsed.configurationId === 'string' ? parsed.configurationId : null,
      teamId: typeof parsed.teamId === 'string' ? parsed.teamId : null,
      next: typeof parsed.next === 'string' ? parsed.next : null,
    };
  } catch {
    return null;
  }
}

/**
 * Vercel's `next` closes the install popup, so it has to be followed - but it
 * arrives in a query string, so it is checked before it is trusted.
 */
export function safeVercelNext(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    return url.hostname === 'vercel.com' || url.hostname.endsWith('.vercel.com') ? url.toString() : null;
  } catch {
    return null;
  }
}

export type IntegrationConfig = {
  clientId: string;
  clientSecret: string;
  slug: string;
};

/**
 * Present only when the operator has registered an integration. Without it the
 * product falls back to asking for a token, which keeps self-hosting viable.
 */
export function integrationConfig(): IntegrationConfig | null {
  const clientId = process.env.VERCEL_INTEGRATION_CLIENT_ID?.trim();
  const clientSecret = process.env.VERCEL_INTEGRATION_CLIENT_SECRET?.trim();
  const slug = process.env.VERCEL_INTEGRATION_SLUG?.trim();

  if (!clientId || !clientSecret || !slug) return null;
  return { clientId, clientSecret, slug };
}

export function isOAuthAvailable(): boolean {
  return integrationConfig() !== null;
}

/** Where the browser is sent to begin the install. */
export function installUrl(slug: string, state: string): string {
  const url = new URL(`https://vercel.com/integrations/${slug}/new`);
  url.searchParams.set('state', state);
  return url.toString();
}

export type ExchangeResult = {
  accessToken: string;
  teamId: string | null;
  installationId: string | null;
};

/**
 * Trades the `code` from the callback for a long-lived access token.
 *
 * The code is single-use and expires after 30 minutes, so a failure here is
 * final for that attempt - the user has to start the install again rather than
 * retry the exchange.
 */
export async function exchangeCode(input: {
  code: string;
  redirectUri: string;
  config: IntegrationConfig;
}): Promise<ExchangeResult> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: input.config.clientId,
      client_secret: input.config.clientSecret,
      code: input.code,
      redirect_uri: input.redirectUri,
    }),
    cache: 'no-store',
  });

  const text = await response.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(text) as Record<string, unknown>;
  } catch {
    // Fall through to the generic message below.
  }

  if (!response.ok) {
    const detail =
      typeof payload.error_description === 'string'
        ? payload.error_description
        : typeof payload.error === 'string'
          ? payload.error
          : `Vercel responded ${response.status}`;
    throw new VercelError(`Could not complete the Vercel connection: ${detail}`, response.status);
  }

  const accessToken = typeof payload.access_token === 'string' ? payload.access_token : null;
  if (!accessToken) {
    throw new VercelError('Vercel did not return an access token.', 502);
  }

  return {
    accessToken,
    // Non-null means the integration was installed on a team, and every
    // subsequent API call must carry teamId or Vercel answers 403.
    teamId: typeof payload.team_id === 'string' ? payload.team_id : null,
    installationId: typeof payload.installation_id === 'string' ? payload.installation_id : null,
  };
}
