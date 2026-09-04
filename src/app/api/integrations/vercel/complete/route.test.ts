import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PENDING_COOKIE, encodePending } from '@/lib/deploy/oauth';

/**
 * Confirming a Vercel-initiated install.
 *
 * This is the step the marketplace callback deliberately stops short of: it
 * spends the authorization code, so it must be reachable only by a signed-in
 * user acting on the cookie the callback set, and the code must not survive to
 * be spent twice.
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

const requireUser = vi.fn();
const requireWorkspace = vi.fn();

/**
 * Replaced whole rather than spread over the real module: importing that pulls
 * in Auth.js, which fails to resolve `next/server` outside a Next build. The
 * error classes are redeclared here because `toErrorResponse` maps them with
 * `instanceof` - it resolves this same mocked module, so the identity matches.
 */
vi.mock('@/lib/tenancy', () => {
  class AuthError extends Error {
    readonly status = 401;
    constructor(message = 'You need to be signed in.') {
      super(message);
      this.name = 'AuthError';
    }
  }
  class ForbiddenError extends Error {
    readonly status = 404;
    constructor(message = 'Not found.') {
      super(message);
      this.name = 'ForbiddenError';
    }
  }
  return {
    AuthError,
    ForbiddenError,
    requireUser: () => requireUser(),
    requireWorkspace: (id: string) => requireWorkspace(id),
  };
});

const connectWorkspaceFromOAuth = vi.fn();
vi.mock('@/lib/deploy/credentials', () => ({
  connectWorkspaceFromOAuth: (input: unknown) => connectWorkspaceFromOAuth(input),
}));

const exchangeCode = vi.fn();
const integrationConfig = vi.fn();
vi.mock('@/lib/deploy/oauth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/deploy/oauth')>();
  return {
    ...actual,
    integrationConfig: () => integrationConfig(),
    exchangeCode: (input: unknown) => exchangeCode(input),
  };
});

const ORIGIN = 'https://studio.example.com';
const request = () => new Request(`${ORIGIN}/api/integrations/vercel/complete`, { method: 'POST' });

async function post() {
  const { POST } = await import('./route');
  return POST(request());
}

const pending = {
  code: 'code_from_vercel',
  configurationId: 'icfg_market',
  teamId: 'team_x',
  next: 'https://vercel.com/integrations/close',
};

beforeEach(() => {
  cookieStore.clear();
  cookieOptions.clear();
  cookieStore.set(PENDING_COOKIE, encodePending(pending));
  requireUser.mockResolvedValue({ id: 'user_1', email: 'a@b.test', name: null, image: null });
  requireWorkspace.mockResolvedValue({ id: 'ws_1', name: 'Demo Studio' });
  integrationConfig.mockReturnValue({ clientId: 'id', clientSecret: 'secret', slug: 'slug' });
  exchangeCode.mockResolvedValue({ accessToken: 'tok_live', teamId: null, installationId: 'icfg_exchange' });
  connectWorkspaceFromOAuth.mockResolvedValue({ connected: true, accountName: 'acme' });
});

describe('confirming an install', () => {
  it('spends the banked code against the registered redirect URI', async () => {
    await post();

    expect(exchangeCode).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'code_from_vercel',
        // Vercel rejects an exchange whose redirect_uri differs from the one
        // registered on the integration, so this has to match the callback.
        redirectUri: `${ORIGIN}/api/integrations/vercel/callback`,
      }),
    );
  });

  it('connects the account to the signed-in user’s workspace', async () => {
    await post();

    expect(connectWorkspaceFromOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceId: 'ws_1', userId: 'user_1', token: 'tok_live', configurationId: 'icfg_market' }),
    );
  });

  it('prefers the team the exchange reports over the one in the query', async () => {
    exchangeCode.mockResolvedValue({ accessToken: 'tok', teamId: 'team_from_exchange', installationId: null });

    await post();

    expect(connectWorkspaceFromOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ teamId: 'team_from_exchange' }),
    );
  });

  it('falls back to the team Vercel sent to the callback when the exchange omits one', async () => {
    exchangeCode.mockResolvedValue({ accessToken: 'tok', teamId: null, installationId: null });

    await post();

    expect(connectWorkspaceFromOAuth).toHaveBeenCalledWith(expect.objectContaining({ teamId: 'team_x' }));
  });

  it('hands back the URL that closes the install popup', async () => {
    const response = await post();

    expect(await response.json()).toMatchObject({ next: 'https://vercel.com/integrations/close' });
  });

  it('clears the cookie, so a single-use code cannot be replayed', async () => {
    await post();

    expect(cookieStore.get(PENDING_COOKIE)).toBe('');
    expect(cookieOptions.get(PENDING_COOKIE)).toMatchObject({ maxAge: 0 });
  });
});

describe('when there is nothing to confirm', () => {
  it('explains that the install expired rather than failing obscurely', async () => {
    cookieStore.delete(PENDING_COOKIE);

    const response = await post();

    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/expired/i);
    expect(exchangeCode).not.toHaveBeenCalled();
  });

  it('does not exchange anything when the cookie is unreadable', async () => {
    cookieStore.set(PENDING_COOKIE, 'tampered-value');

    const response = await post();

    expect(response.status).toBe(400);
    expect(exchangeCode).not.toHaveBeenCalled();
  });

  it('refuses a signed-out caller before touching the code', async () => {
    const { AuthError } = (await import('@/lib/tenancy')) as unknown as {
      AuthError: new (message?: string) => Error;
    };
    requireUser.mockRejectedValue(new AuthError());

    const response = await post();

    expect(response.status).toBe(401);
    expect(exchangeCode).not.toHaveBeenCalled();
  });
});

describe('abandoning an install', () => {
  it('drops the banked code rather than leaving it sitting in the browser', async () => {
    const { DELETE } = await import('./route');

    // Takes no arguments: it reads the cookie jar, not the request.
    await DELETE();

    expect(cookieStore.get(PENDING_COOKIE)).toBe('');
    expect(cookieOptions.get(PENDING_COOKIE)).toMatchObject({ maxAge: 0 });
  });
});
