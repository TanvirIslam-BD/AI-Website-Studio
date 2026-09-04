import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { aiStatus } from '@/lib/ai';
import { isVercelConfigured } from '@/lib/deploy/vercel';
import { isOAuthAvailable } from '@/lib/deploy/oauth';
import { isEncryptionConfigured } from '@/lib/crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Deployment diagnostics.
 *
 * Reports whether each required piece of configuration is present and whether
 * the database is actually usable. Deliberately booleans and names only - never
 * a value, never a prefix, and never the underlying error text, which for a
 * driver failure would carry the query and the schema shape. The real error goes
 * to the server log, where it belongs.
 *
 * This exists because a missing environment variable in production surfaces as
 * Auth.js's generic "problem with the server configuration" page, which gives
 * no indication of which variable is missing.
 */

const isSet = (name: string) => Boolean(process.env[name]?.trim());

type DatabaseState = 'ok' | 'unreachable' | 'schema-missing' | 'schema-stale';

/**
 * One probe per table, each naming every column the app expects.
 *
 * `findFirst()` without a `select` makes Prisma list all of a model's scalar
 * fields in the query, so a column the schema has and the database does not
 * fails here - even on an empty table, because the statement is rejected before
 * any row is read. Prisma's generated client is the source of truth, so this
 * cannot drift from the schema the way a hand-written column list would.
 *
 * Counting users, which is all this used to do, catches a database that is
 * unreachable or entirely unmigrated. It cannot catch the far more likely
 * failure: a schema change deployed without running `db:push`, leaving one
 * table short of a column. That reads as healthy right up until the first write
 * to the affected table fails in production.
 */
const PROBES: Record<string, () => Prisma.PrismaPromise<unknown>> = {
  User: () => db.user.findFirst(),
  Account: () => db.account.findFirst(),
  Session: () => db.session.findFirst(),
  VerificationToken: () => db.verificationToken.findFirst(),
  Workspace: () => db.workspace.findFirst(),
  Membership: () => db.membership.findFirst(),
  Project: () => db.project.findFirst(),
  Theme: () => db.theme.findFirst(),
  Page: () => db.page.findFirst(),
  Section: () => db.section.findFirst(),
  Asset: () => db.asset.findFirst(),
  HostingConnection: () => db.hostingConnection.findFirst(),
  Deployment: () => db.deployment.findFirst(),
  ChatMessage: () => db.chatMessage.findFirst(),
  Revision: () => db.revision.findFirst(),
};

function classify(error: unknown): Exclude<DatabaseState, 'ok'> {
  const message = error instanceof Error ? error.message : String(error);
  if (/no such table/i.test(message)) return 'schema-missing';
  if (/no such column|has no column named/i.test(message)) return 'schema-stale';
  return 'unreachable';
}

async function checkDatabase(): Promise<{ state: DatabaseState; tables: string[] }> {
  const names = Object.keys(PROBES);

  try {
    // One batch, so the healthy path costs a single round trip rather than one
    // per table - this endpoint gets polled by uptime monitors.
    await db.$transaction(names.map((name) => PROBES[name]()));
    return { state: 'ok', tables: [] };
  } catch (error) {
    console.error('[health] database check failed:', error instanceof Error ? error.message : String(error));
  }

  // Something is wrong. Find out what, and which tables, so the response can
  // say more than "broken". Only reached when already failing, so the extra
  // round trips cost nothing in the healthy case.
  const failures: Array<{ table: string; state: Exclude<DatabaseState, 'ok'> }> = [];
  for (const name of names) {
    try {
      await PROBES[name]();
    } catch (error) {
      failures.push({ table: name, state: classify(error) });
    }
  }

  if (failures.length === 0) {
    // The batch failed but every table reads on its own - a transient blip
    // rather than a broken schema.
    return { state: 'unreachable', tables: [] };
  }

  // A missing table is the more fundamental problem, so it wins the label.
  const state: DatabaseState = failures.some((f) => f.state === 'schema-missing')
    ? 'schema-missing'
    : failures.some((f) => f.state === 'schema-stale')
      ? 'schema-stale'
      : 'unreachable';

  return {
    state,
    // Table names come from our own schema, which is public. The driver's
    // message, which would carry the query, does not leave the server.
    tables: state === 'unreachable' ? [] : failures.map((f) => f.table),
  };
}

function hintFor(config: { AUTH_SECRET: boolean }, database: DatabaseState, tables: string[]): string | null {
  if (!config.AUTH_SECRET) return 'Set AUTH_SECRET in the hosting environment, then redeploy.';

  if (database === 'schema-missing') {
    return 'The database is reachable but has no tables. Run `npm run db:push` against it.';
  }
  if (database === 'schema-stale') {
    return `The database is missing columns the app expects on: ${tables.join(', ')}. A schema change was deployed without migrating. Run \`npm run db:push\` against it - and check it reports the remote database rather than a local file.`;
  }
  if (database === 'unreachable') {
    return 'Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the hosting environment, then redeploy.';
  }
  return null;
}

export async function GET() {
  const config = {
    AUTH_SECRET: isSet('AUTH_SECRET'),
    TURSO_DATABASE_URL: isSet('TURSO_DATABASE_URL'),
    TURSO_AUTH_TOKEN: isSet('TURSO_AUTH_TOKEN'),
    DATABASE_URL: isSet('DATABASE_URL'),
  };

  const { state: database, tables } = await checkDatabase();
  const ai = aiStatus();
  const ready = config.AUTH_SECRET && database === 'ok';

  /**
   * Whether users can connect their own hosting account.
   *
   * Not part of `ready` - the studio generates and edits sites without any of
   * it. But these three are set together and are easy to get half-right, and a
   * half-configured connect flow fails at publish time rather than at the
   * point of misconfiguration. `encryptionKey` checks the key actually decodes
   * to 32 bytes, so a truncated paste is caught here too.
   */
  const hosting = {
    encryptionKey: isEncryptionConfigured(),
    integrationOAuth: isOAuthAvailable(),
    platformFallbackToken: isVercelConfigured(),
  };

  return NextResponse.json(
    {
      ready,
      environment: process.env.NODE_ENV,
      config,
      database,
      /** Which tables failed, when the schema is the problem. Empty otherwise. */
      databaseTables: tables,
      ai: { configured: ai.configured, provider: ai.provider },
      hosting,
      /** Actionable next step, so the response is useful on its own. */
      hint: hintFor(config, database, tables),
    },
    { status: ready ? 200 : 503 },
  );
}
