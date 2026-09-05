import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  decodePending,
  encodePending,
  installUrl,
  integrationConfig,
  isOAuthAvailable,
  safeVercelNext,
  type PendingInstall,
} from './oauth';

/**
 * The OAuth helpers.
 *
 * Two of these decide security properties rather than behaviour, so they are
 * tested against hostile input rather than only the happy path: `safeVercelNext`
 * is the only thing standing between a query parameter and an open redirect,
 * and `decodePending` parses a cookie that carries an authorization code.
 */

describe('safeVercelNext', () => {
  it('accepts the URL Vercel sends to close the install popup', () => {
    expect(safeVercelNext('https://vercel.com/integrations/close')).toBe('https://vercel.com/integrations/close');
  });

  it('accepts subdomains of vercel.com', () => {
    expect(safeVercelNext('https://api.vercel.com/x')).toBe('https://api.vercel.com/x');
  });

  it.each([
    ['nothing at all', null],
    ['an empty string', ''],
    ['a bare path, which is not a URL', '/dashboard'],
    ['plain http, which could be intercepted', 'http://vercel.com/close'],
    ['an unrelated host', 'https://example.com/close'],
    ['a script URL', 'javascript:alert(1)'],
    ['nonsense', 'not a url at all'],
  ])('rejects %s', (_label, value) => {
    expect(safeVercelNext(value)).toBeNull();
  });

  /**
   * The cases a substring check would wave through. A redirect to an
   * attacker-controlled host is the whole risk this function exists to stop.
   */
  it.each([
    'https://evil-vercel.com/close',
    'https://vercel.com.evil.com/close',
    'https://notvercel.com/close',
    'https://vercel.co/close',
  ])('rejects the look-alike host %s', (value) => {
    expect(safeVercelNext(value)).toBeNull();
  });
});

describe('pending install envelope', () => {
  const pending: PendingInstall = {
    code: 'code_from_vercel',
    configurationId: 'icfg_123',
    teamId: 'team_abc',
    next: 'https://vercel.com/integrations/close',
  };

  it('survives a round trip through a cookie value', () => {
    expect(decodePending(encodePending(pending))).toEqual(pending);
  });

  it('keeps the optional fields null rather than dropping them', () => {
    const sparse: PendingInstall = { code: 'only_a_code', configurationId: null, teamId: null, next: null };
    expect(decodePending(encodePending(sparse))).toEqual(sparse);
  });

  it('produces a value safe to put in a cookie', () => {
    // Base64url only: no ';', '=' padding or whitespace to terminate the cookie
    // early or need escaping.
    expect(encodePending(pending)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it.each([
    ['no cookie', undefined],
    ['an empty cookie', ''],
    ['a value that is not base64', 'not-base64-at-all!!'],
    ['base64 that is not JSON', Buffer.from('plain text', 'utf8').toString('base64url')],
    ['JSON that is not an object', Buffer.from('[1,2,3]', 'utf8').toString('base64url')],
  ])('returns null for %s', (_label, value) => {
    expect(decodePending(value)).toBeNull();
  });

  /**
   * A decode that returned `{ code: undefined }` would send an undefined code
   * to Vercel's token endpoint instead of failing here, where the error is
   * clear.
   */
  it.each([
    ['the code is missing', { configurationId: 'icfg_1' }],
    ['the code is empty', { code: '' }],
    ['the code is not a string', { code: 12345 }],
  ])('returns null when %s', (_label, payload) => {
    const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    expect(decodePending(encoded)).toBeNull();
  });

  it('drops fields of the wrong type instead of passing them through', () => {
    const encoded = Buffer.from(
      JSON.stringify({ code: 'ok', configurationId: 42, teamId: {}, next: false }),
      'utf8',
    ).toString('base64url');
    expect(decodePending(encoded)).toEqual({ code: 'ok', configurationId: null, teamId: null, next: null });
  });
});

describe('integrationConfig', () => {
  /**
   * `vi.stubEnv` rather than assigning to `process.env` and restoring a
   * snapshot. The snapshot version replaced the whole object - which drops any
   * variable set after this file loaded, and swaps Node's env object for a
   * plain one - to undo three keys. Stubs are tracked and unwound individually.
   */
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const set = (id?: string, secret?: string, slug?: string) => {
    vi.stubEnv('VERCEL_INTEGRATION_CLIENT_ID', id);
    vi.stubEnv('VERCEL_INTEGRATION_CLIENT_SECRET', secret);
    vi.stubEnv('VERCEL_INTEGRATION_SLUG', slug);
  };

  it('is available only when all three variables are present', () => {
    set('id', 'secret', 'slug');
    expect(integrationConfig()).toEqual({ clientId: 'id', clientSecret: 'secret', slug: 'slug' });
    expect(isOAuthAvailable()).toBe(true);
  });

  it.each([
    ['the client id', [undefined, 'secret', 'slug']],
    ['the secret', ['id', undefined, 'slug']],
    ['the slug', ['id', 'secret', undefined]],
  ])('is unavailable when %s is missing, so the token fallback is offered', (_label, [id, secret, slug]) => {
    set(id, secret, slug);
    expect(integrationConfig()).toBeNull();
    expect(isOAuthAvailable()).toBe(false);
  });

  it('treats whitespace as unset, so a blank env var does not half-enable it', () => {
    set('   ', 'secret', 'slug');
    expect(integrationConfig()).toBeNull();
  });
});

describe('installUrl', () => {
  it('carries the state through to Vercel so the callback can match it', () => {
    const url = new URL(installUrl('web-copilot-ai-studio', 'state-value'));
    expect(url.origin + url.pathname).toBe('https://vercel.com/integrations/web-copilot-ai-studio/new');
    expect(url.searchParams.get('state')).toBe('state-value');
  });

  it('escapes a state value rather than letting it add parameters', () => {
    const url = new URL(installUrl('slug', 'a&b=c'));
    expect(url.searchParams.get('state')).toBe('a&b=c');
  });
});
