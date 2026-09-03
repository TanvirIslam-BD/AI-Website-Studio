import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiStatus } from '@/lib/ai';
import { isVercelConfigured } from '@/lib/deploy/vercel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Deployment diagnostics.
 *
 * Reports whether each required piece of configuration is present and whether
 * the database is reachable. Deliberately booleans only - never a value, never
 * a prefix, and never the underlying error text, which for a driver failure
 * would carry the query and schema shape. The real error goes to the server
 * log, where it belongs.
 *
 * This exists because a missing environment variable in production surfaces as
 * Auth.js's generic "problem with the server configuration" page, which gives
 * no indication of which variable is missing.
 */

const isSet = (name: string) => Boolean(process.env[name]?.trim());

export async function GET() {
  const config = {
    AUTH_SECRET: isSet('AUTH_SECRET'),
    TURSO_DATABASE_URL: isSet('TURSO_DATABASE_URL'),
    TURSO_AUTH_TOKEN: isSet('TURSO_AUTH_TOKEN'),
    DATABASE_URL: isSet('DATABASE_URL'),
  };

  let database: 'ok' | 'unreachable' | 'schema-missing' = 'ok';
  try {
    // Touches a real table, so a connected-but-unmigrated database is caught
    // rather than reported healthy.
    await db.user.count();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    database = /no such table/i.test(message) ? 'schema-missing' : 'unreachable';
    console.error('[health] database check failed:', message);
  }

  const ai = aiStatus();
  const ready = config.AUTH_SECRET && database === 'ok';

  return NextResponse.json(
    {
      ready,
      environment: process.env.NODE_ENV,
      config,
      database,
      ai: { configured: ai.configured, provider: ai.provider },
      deployment: { vercelConfigured: isVercelConfigured() },
      /** Actionable next step, so the response is useful on its own. */
      hint: ready
        ? null
        : !config.AUTH_SECRET
          ? 'Set AUTH_SECRET in the hosting environment, then redeploy.'
          : database === 'schema-missing'
            ? 'The database is reachable but has no tables. Run `npm run db:push` against it.'
            : 'Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the hosting environment, then redeploy.',
    },
    { status: ready ? 200 : 503 },
  );
}
