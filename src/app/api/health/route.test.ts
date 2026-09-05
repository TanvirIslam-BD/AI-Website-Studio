import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The health check.
 *
 * The case that matters most here is the one it used to miss. Counting users
 * catches a database that is unreachable or entirely unmigrated; it cannot
 * catch a schema change deployed without migrating, which leaves one table
 * short of a column while every other table reads perfectly. That reported
 * `database: "ok"` while every write to the affected table failed in
 * production.
 */

/** One mock per table, so a test can break exactly one of them. */
const TABLES = [
  'user', 'account', 'session', 'verificationToken', 'workspace', 'membership',
  'project', 'theme', 'page', 'section', 'asset', 'hostingConnection',
  'deployment', 'chatMessage', 'revision',
] as const;

const findFirst = new Map<string, ReturnType<typeof vi.fn>>();
const transaction = vi.fn();

vi.mock('@/lib/db', () => {
  const client: Record<string, unknown> = {
    $transaction: (promises: unknown[]) => transaction(promises),
  };
  for (const table of TABLES) {
    client[table] = {
      findFirst: () => {
        const mock = findFirst.get(table);
        return mock ? mock() : Promise.resolve(null);
      },
    };
  }
  return { db: client, isRemoteDatabase: () => true };
});

vi.mock('@/lib/ai', () => ({ aiStatus: () => ({ configured: true, provider: 'comet' }) }));
vi.mock('@/lib/deploy/vercel', () => ({ isVercelConfigured: () => true }));
vi.mock('@/lib/deploy/oauth', () => ({ isOAuthAvailable: () => true }));
vi.mock('@/lib/crypto', () => ({ isEncryptionConfigured: () => true }));

type Health = {
  ready: boolean;
  database: string;
  databaseTables: string[];
  hint: string | null;
};

async function get(): Promise<{ status: number; body: Health }> {
  const { GET } = await import('./route');
  const response = await GET();
  return { status: response.status, body: (await response.json()) as Health };
}

/** Makes one table fail the way the driver reports that problem. */
function breakTable(table: string, message: string) {
  findFirst.set(table, vi.fn().mockRejectedValue(new Error(message)));
  transaction.mockRejectedValue(new Error(message));
}

beforeEach(() => {
  findFirst.clear();
  transaction.mockReset();
  transaction.mockResolvedValue([]);
  // Stubbed, not assigned: the suite below deletes it in one test, and an
  // assignment left standing makes the rest of the file order-dependent.
  vi.stubEnv('AUTH_SECRET', 'set-for-tests');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('a healthy database', () => {
  it('reports ok with a 200 and no hint', async () => {
    const { status, body } = await get();

    expect(status).toBe(200);
    expect(body).toMatchObject({ ready: true, database: 'ok', databaseTables: [], hint: null });
  });

  it('probes in one batch, so the healthy path is a single round trip', async () => {
    await get();

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction.mock.calls[0][0]).toHaveLength(TABLES.length);
  });
});

describe('a schema change deployed without migrating', () => {
  // The exact failure that reported "ok" while production was broken.
  beforeEach(() => breakTable('project', 'no such column: main.Project.vercelProjectId'));

  it('is reported as stale rather than ok', async () => {
    const { body } = await get();

    expect(body.database).toBe('schema-stale');
  });

  it('fails readiness, so a monitor notices', async () => {
    const { status, body } = await get();

    expect(status).toBe(503);
    expect(body.ready).toBe(false);
  });

  it('names the table that is short a column', async () => {
    const { body } = await get();

    expect(body.databaseTables).toEqual(['Project']);
  });

  it('says what to run, including the trap that wasted the most time', async () => {
    const { body } = await get();

    expect(body.hint).toContain('Project');
    expect(body.hint).toContain('db:push');
    // Running it against a local file and seeing "already in sync" is exactly
    // how this gets missed twice.
    expect(body.hint).toMatch(/remote database rather than a local file/i);
  });

  it('never leaks the driver message, which carries the query', async () => {
    const { body } = await get();

    expect(JSON.stringify(body)).not.toContain('no such column');
    expect(JSON.stringify(body)).not.toContain('main.Project');
  });
});

describe('a database with no tables at all', () => {
  beforeEach(() => breakTable('user', 'no such table: main.User'));

  it('is distinguished from a merely stale schema', async () => {
    const { body } = await get();

    expect(body.database).toBe('schema-missing');
    expect(body.hint).toMatch(/no tables/i);
  });

  it('outranks a stale column when both are true', async () => {
    // A wholly unmigrated database reports both; the missing table is the
    // more fundamental problem and should be the one named.
    findFirst.set('project', vi.fn().mockRejectedValue(new Error('no such column: main.Project.x')));

    expect((await get()).body.database).toBe('schema-missing');
  });
});

describe('a database that cannot be reached', () => {
  beforeEach(() => {
    const failure = new Error('connect ECONNREFUSED');
    transaction.mockRejectedValue(failure);
    for (const table of TABLES) findFirst.set(table, vi.fn().mockRejectedValue(failure));
  });

  it('is reported as unreachable', async () => {
    const { body } = await get();

    expect(body.database).toBe('unreachable');
  });

  it('does not list every table as broken, which would say nothing', async () => {
    const { body } = await get();

    expect(body.databaseTables).toEqual([]);
    expect(body.hint).toMatch(/TURSO_DATABASE_URL/);
  });
});

describe('a transient failure', () => {
  it('is not mistaken for a broken schema when every table still reads', async () => {
    // The batch failed, but each probe succeeds on its own.
    transaction.mockRejectedValue(new Error('socket hang up'));

    const { body } = await get();

    expect(body.database).toBe('unreachable');
    expect(body.databaseTables).toEqual([]);
  });
});

describe('configuration problems', () => {
  it('reports a missing AUTH_SECRET ahead of anything else', async () => {
    vi.stubEnv('AUTH_SECRET', '');
    breakTable('project', 'no such column: main.Project.x');

    const { body } = await get();

    // Without a secret nobody can sign in at all, so that is the first fix.
    expect(body.ready).toBe(false);
    expect(body.hint).toMatch(/AUTH_SECRET/);
  });
});
