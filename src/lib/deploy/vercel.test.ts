import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VercelError, listProjects, productionUrlFor, vercelProjectName } from './vercel';

/**
 * The Vercel client.
 *
 * `listProjects` backs the project picker, so what is pinned here is the part
 * that is easy to get quietly wrong: paging. Vercel pages projects by timestamp
 * rather than offset, and a picker that stopped after the first page would hide
 * exactly the project someone came looking for.
 */

const credentials = { token: 'tok_test' };

let fetchMock: ReturnType<typeof vi.fn>;

function respond(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: async () => JSON.stringify(body),
  };
}

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** The URL the client actually requested, for asserting query parameters. */
const requestedUrl = (call = 0) => new URL(String(fetchMock.mock.calls[call][0]));

describe('listProjects', () => {
  it('returns the projects and the cursor for the next page', async () => {
    fetchMock.mockResolvedValue(
      respond({
        projects: [{ id: 'prj_1', name: 'marketing-site', framework: 'nextjs', updatedAt: 1700000000000 }],
        pagination: { next: 1699999999999 },
      }),
    );

    const page = await listProjects(credentials);

    expect(page.projects).toEqual([
      { id: 'prj_1', name: 'marketing-site', framework: 'nextjs', updatedAt: 1700000000000, url: null },
    ]);
    expect(page.next).toBe(1699999999999);
  });

  it('reports the end of the list as a null cursor', async () => {
    fetchMock.mockResolvedValue(respond({ projects: [], pagination: { next: null } }));

    expect((await listProjects(credentials)).next).toBeNull();
  });

  it('treats a missing pagination block as the end rather than crashing', async () => {
    fetchMock.mockResolvedValue(respond({ projects: [{ id: 'p', name: 'n' }] }));

    const page = await listProjects(credentials);
    expect(page.next).toBeNull();
    expect(page.projects[0]).toMatchObject({ id: 'p', name: 'n', framework: null, url: null });
  });

  it('passes the cursor back as `until` so the next page continues where the last ended', async () => {
    fetchMock.mockResolvedValue(respond({ projects: [], pagination: { next: null } }));

    await listProjects(credentials, { until: 1699999999999 });

    expect(requestedUrl().searchParams.get('until')).toBe('1699999999999');
  });

  it('omits `until` on the first page', async () => {
    fetchMock.mockResolvedValue(respond({ projects: [], pagination: { next: null } }));

    await listProjects(credentials);

    expect(requestedUrl().searchParams.has('until')).toBe(false);
  });

  it.each([
    ['clamps a huge limit to what Vercel accepts', 5000, '100'],
    ['clamps a zero limit up to one', 0, '1'],
    ['clamps a negative limit up to one', -10, '1'],
    ['passes a sensible limit through', 25, '25'],
  ])('%s', async (_label, limit, expected) => {
    fetchMock.mockResolvedValue(respond({ projects: [], pagination: { next: null } }));

    await listProjects(credentials, { limit });

    expect(requestedUrl().searchParams.get('limit')).toBe(expected);
  });

  it('scopes the request to the team when the credential belongs to one', async () => {
    fetchMock.mockResolvedValue(respond({ projects: [], pagination: { next: null } }));

    await listProjects({ token: 'tok', teamId: 'team_abc' });

    // Without this Vercel answers about the personal account instead.
    expect(requestedUrl().searchParams.get('teamId')).toBe('team_abc');
  });

  it('builds an absolute production URL from the bare hostname Vercel returns', async () => {
    fetchMock.mockResolvedValue(
      respond({
        projects: [{ id: 'p', name: 'n', targets: { production: { url: 'site.vercel.app' } } }],
        pagination: { next: null },
      }),
    );

    expect((await listProjects(credentials)).projects[0].url).toBe('https://site.vercel.app');
  });

  it('does not double up the scheme when one is already present', async () => {
    fetchMock.mockResolvedValue(
      respond({
        projects: [{ id: 'p', name: 'n', targets: { production: { url: 'https://site.vercel.app' } } }],
        pagination: { next: null },
      }),
    );

    expect((await listProjects(credentials)).projects[0].url).toBe('https://site.vercel.app');
  });

  it('surfaces a rejected credential as a VercelError rather than a parse failure', async () => {
    fetchMock.mockResolvedValue(
      respond({ error: { message: 'Not authorized', code: 'forbidden' } }, { ok: false, status: 403 }),
    );

    await expect(listProjects(credentials)).rejects.toBeInstanceOf(VercelError);
  });
});

describe('vercelProjectName', () => {
  it('is stable for a project, so repeat deploys reuse one Vercel project', () => {
    expect(vercelProjectName('my-site', 'clx123456abcdef')).toBe(vercelProjectName('my-site', 'clx123456abcdef'));
  });

  it('distinguishes two sites that share a slug', () => {
    expect(vercelProjectName('site', 'aaaaaaaaaaaa')).not.toBe(vercelProjectName('site', 'bbbbbbbbbbbb'));
  });

  it.each([
    ['uppercase', 'My Site'],
    ['punctuation', 'café & bar!'],
    ['leading and trailing junk', '---site---'],
  ])('produces a name Vercel accepts from %s', (_label, slug) => {
    const name = vercelProjectName(slug, 'abcdef123456');

    // Vercel: lowercase alphanumerics and dashes, no leading or trailing dash.
    expect(name).toMatch(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/);
    expect(name.length).toBeLessThanOrEqual(90);
  });

  it('falls back to a usable name when the slug has nothing left', () => {
    expect(vercelProjectName('!!!', 'abcdef123456')).toMatch(/^site-/);
  });
});

describe('productionUrlFor', () => {
  const deployment = (aliases: string[], url: string | null = 'https://fallback.vercel.app') => ({
    id: 'dpl_1',
    url,
    inspectorUrl: null,
    readyState: 'READY' as const,
    aliases,
  });

  it('prefers the clean production alias over the hashed and branch ones', () => {
    expect(
      productionUrlFor(
        deployment([
          'https://site-abc123def.vercel.app',
          'https://site-git-main-team.vercel.app',
          'https://site.vercel.app',
        ]),
      ),
    ).toBe('https://site.vercel.app');
  });

  it('falls back to the deployment URL when no alias has been assigned yet', () => {
    expect(productionUrlFor(deployment([]))).toBe('https://fallback.vercel.app');
  });
});
