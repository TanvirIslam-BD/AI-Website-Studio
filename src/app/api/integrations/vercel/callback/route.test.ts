import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PENDING_COOKIE, RETURN_COOKIE, STATE_COOKIE, decodePending } from '@/lib/deploy/oauth';

/**
 * The Vercel OAuth callback.
 *
 * Two journeys arrive here and they must end differently. An install started in
 * this app carries a `state` cookie we issued; an install started from the
 * Vercel Marketplace carries none, because Vercel begins that flow. Requiring
 * `state` unconditionally rejected every marketplace install, and following our
 * own return path instead of Vercel's `next` left the popup open forever - so
 * both are pinned here.
 *
 * The security property is pinned too: the marketplace path must not connect
 * anything on arrival. Without a `state` there is nothing showing the person
 * meant to attach that account to their workspace, so a link carrying someone
 * else's code must not spend it.
 */

const cookieStore = new Map<string, string>();
const cookieOptions = new Map<string, Record<string, unknown>>();

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (cookieStore.has(name) ? { name, value: cookieStore.get(name)! } : undefined),
    set: (name: string, value: string, options?: Record<string, unknown>) => {
      cookieStore.set(name, value);
      if (options) cookieOptions.set(name, options);
    },
  }),
}));

const currentUser = vi.fn();
const requireWorkspace = vi.fn();
vi.mock('@/lib/tenancy', () => ({
  currentUser: () => currentUser(),
  requireWorkspace: (userId: string) => requireWorkspace(userId),
}));

const connectWorkspaceFromOAuth = vi.fn();
vi.mock('@/lib/deploy/credentials', () => ({
  connectWorkspaceFromOAuth: (input: unknown) => connectWorkspaceFromOAuth(input),
}));

const exchangeCode = vi.fn();
const integrationConfig = vi.fn();
vi.mock('@/lib/deploy/oauth', async (importOriginal) => {
  // The pure helpers stay real - they are the thing under test alongside the
  // branch logic. Only the two that reach the network or the environment are
  // replaced.
  const actual = await importOriginal<typeof import('@/lib/deploy/oauth')>();
  return {
    ...actual,
    integrationConfig: () => integrationConfig(),
    exchangeCode: (input: unknown) => exchangeCode(input),
  };
});

const ORIGIN = 'https://studio.example.com';
const callback = (query: string) => new Request(`${ORIGIN}/api/integrations/vercel/callback${query}`);

async function run(query: string) {
  const { GET } = await import('./route');
  return GET(callback(query));
}

beforeEach(() => {
  cookieStore.clear();
  cookieOptions.clear();
  currentUser.mockResolvedValue({ id: 'user_1', email: 'a@b.test', name: null, image: null });
  requireWorkspace.mockResolvedValue({ id: 'ws_1', name: 'Demo Studio' });
  integrationConfig.mockReturnValue({ clientId: 'id', clientSecret: 'secret', slug: 'slug' });
  exchangeCode.mockResolvedValue({ accessToken: 'tok_live', teamId: null, installationId: 'icfg_from_exchange' });
  connectWorkspaceFromOAuth.mockResolvedValue({ connected: true });
});

describe('an install that started on Vercel', () => {
  const marketplace =
    '?code=code_from_vercel&configurationId=icfg_market&teamId=team_x&next=https%3A%2F%2Fvercel.com%2Fintegrations%2Fclose';

  it('is no longer refused for having no state cookie', async () => {
    const response = await run(marketplace);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/integrations/vercel/setup`);
  });

  it('connects nothing until the user confirms', async () => {
    await run(marketplace);

    // The whole point: a link carrying someone else's code must not spend it.
    expect(exchangeCode).not.toHaveBeenCalled();
    expect(connectWorkspaceFromOAuth).not.toHaveBeenCalled();
  });

  it('banks the code where page scripts cannot read it', async () => {
    await run(marketplace);

    const options = cookieOptions.get(PENDING_COOKIE);
    expect(options).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' });
    expect(options?.maxAge).toBeGreaterThan(0);
  });

  it('carries the install details through to the setup screen', async () => {
    await run(marketplace);

    expect(decodePending(cookieStore.get(PENDING_COOKIE))).toEqual({
      code: 'code_from_vercel',
      configurationId: 'icfg_market',
      teamId: 'team_x',
      next: 'https://vercel.com/integrations/close',
    });
  });

  it('refuses to store a next URL pointing somewhere other than Vercel', async () => {
    await run('?code=c&next=https%3A%2F%2Fevil.example.com%2Fsteal');

    // Kept, but with the hostile redirect dropped rather than the install failing.
    expect(decodePending(cookieStore.get(PENDING_COOKIE))?.next).toBeNull();
  });

  it('still works when Vercel sends no next at all', async () => {
    const response = await run('?code=c&configurationId=icfg_1');

    expect(response.headers.get('location')).toBe(`${ORIGIN}/integrations/vercel/setup`);
    expect(decodePending(cookieStore.get(PENDING_COOKIE))?.next).toBeNull();
  });
});

describe('an install that started in the app', () => {
  beforeEach(() => {
    cookieStore.set(STATE_COOKIE, 'the-state');
    cookieStore.set(RETURN_COOKIE, '/editor/proj_1');
  });

  it('connects and returns the user to the screen they left', async () => {
    const response = await run('?code=c&state=the-state&configurationId=icfg_app');

    expect(exchangeCode).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'c', redirectUri: `${ORIGIN}/api/integrations/vercel/callback` }),
    );
    expect(connectWorkspaceFromOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceId: 'ws_1', userId: 'user_1', token: 'tok_live', configurationId: 'icfg_app' }),
    );
    expect(response.headers.get('location')).toBe(`${ORIGIN}/editor/proj_1?vercel=connected`);
  });

  it('falls back to the installation id when Vercel sends no configurationId', async () => {
    await run('?code=c&state=the-state');

    expect(connectWorkspaceFromOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ configurationId: 'icfg_from_exchange' }),
    );
  });

  /**
   * The CSRF check this path exists for. It must survive the marketplace branch
   * being added above it.
   */
  it('rejects a state that does not match the cookie', async () => {
    const response = await run('?code=c&state=attacker-supplied');

    expect(exchangeCode).not.toHaveBeenCalled();
    expect(connectWorkspaceFromOAuth).not.toHaveBeenCalled();
    expect(response.headers.get('location')).toContain('vercel=error');
    expect(response.headers.get('location')).toContain('could+not+be+verified');
  });

  it('rejects a missing state when one was expected', async () => {
    const response = await run('?code=c');

    expect(connectWorkspaceFromOAuth).not.toHaveBeenCalled();
    expect(response.headers.get('location')).toContain('vercel=error');
  });

  it('reports a failed exchange back on the screen they came from', async () => {
    exchangeCode.mockRejectedValue(new Error('Vercel responded 400'));

    const response = await run('?code=c&state=the-state');
    const location = new URL(response.headers.get('location')!);

    expect(location.pathname).toBe('/editor/proj_1');
    expect(location.searchParams.get('vercel')).toBe('error');
    expect(location.searchParams.get('reason')).toBe('Vercel responded 400');
  });
});

describe('guards that apply to both journeys', () => {
  it('sends a signed-out visitor to sign in, keeping the code for the return trip', async () => {
    currentUser.mockResolvedValue(null);

    const response = await run('?code=c&configurationId=icfg_1');
    const location = new URL(response.headers.get('location')!);

    expect(location.pathname).toBe('/signin');
    // Dropping them on a 401 mid-install would lose the code entirely.
    expect(location.searchParams.get('next')).toContain('/api/integrations/vercel/callback');
    expect(location.searchParams.get('next')).toContain('code=c');
  });

  it('fails when Vercel returns no code', async () => {
    const response = await run('?configurationId=icfg_1');

    expect(cookieStore.has(PENDING_COOKIE)).toBe(false);
    expect(response.headers.get('location')).toContain('vercel=error');
  });

  it('fails when the server has no integration registered', async () => {
    integrationConfig.mockReturnValue(null);

    const response = await run('?code=c');

    expect(response.headers.get('location')).toContain('vercel=error');
    expect(response.headers.get('location')).toContain('not+configured');
  });
});
