import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

/**
 * Prisma client over Turso (libSQL).
 *
 * One code path serves both environments. Set TURSO_DATABASE_URL to talk to a
 * Turso database; leave it unset and the same adapter opens the local SQLite
 * file that the Prisma CLI uses, so development, migrations and production all
 * run against an identical driver.
 *
 * This uses the adapter's Node build, which supports both remote Turso and
 * local `file:` URLs and runs fine on Vercel's Node runtime. If you ever need
 * an edge/worker runtime, switch the import to `@prisma/adapter-libsql/web`,
 * which is HTTP-only: no native module, but no local file support either.
 *
 * Note the matching entry in next.config.mjs `serverExternalPackages` - without
 * it webpack cannot bundle the adapter's dynamic requires.
 */

/**
 * Prisma resolves a relative `file:` URL against the schema's directory
 * (`prisma/`), but at runtime the process cwd is the project root. Without this
 * the CLI and the app would quietly use two different database files.
 */
function resolveFileUrl(url: string): string {
  const target = url.slice('file:'.length);
  if (path.isAbsolute(target)) return url;
  return `file:${path.resolve(process.cwd(), 'prisma', target)}`;
}

function createAdapter(): PrismaLibSQL {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();

  if (tursoUrl) {
    return new PrismaLibSQL({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined,
    });
  }

  /**
   * Never fall back to a local file in production.
   *
   * A serverless filesystem is ephemeral and starts empty, so the fallback
   * would happily open a brand new SQLite file and then fail on the first
   * query with "no such table: main.User" - a baffling error a long way from
   * its cause. Failing at startup with the actual reason is far cheaper to
   * diagnose than a missing-table error at request time.
   */
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'TURSO_DATABASE_URL is not set. Production requires a Turso database: set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the hosting environment, then apply the schema with `npm run db:push`.',
    );
  }

  const localUrl = process.env.DATABASE_URL?.trim();
  if (!localUrl) {
    throw new Error(
      'No database configured. Set TURSO_DATABASE_URL (with TURSO_AUTH_TOKEN) for Turso, or DATABASE_URL to a local file: URL.',
    );
  }
  if (!localUrl.startsWith('file:')) {
    throw new Error(
      `DATABASE_URL must be a file: URL for local development (got "${localUrl.split(':')[0]}:"). Use TURSO_DATABASE_URL for a remote Turso database.`,
    );
  }

  return new PrismaLibSQL({ url: resolveFileUrl(localUrl) });
}

/** Next.js hot-reloads modules, so cache the client to avoid leaking connections. */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const client = new PrismaClient({
    adapter: createAdapter(),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
  return client;
}

/**
 * Constructed on first use, not at import.
 *
 * `next build` evaluates every route module to collect page data, so building
 * the client at module scope would make a missing TURSO_DATABASE_URL fail the
 * build rather than the request - and the build machine has no reason to hold
 * database credentials. Deferring behind a proxy keeps importing this module
 * free of side effects while callers still see a plain PrismaClient.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = globalForPrisma.prisma ?? createClient();
    const value = Reflect.get(client, property, client);
    // Methods must keep the client as their receiver once detached.
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

/** True when the app is pointed at a remote Turso database rather than a file. */
export function isRemoteDatabase(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL?.trim());
}
