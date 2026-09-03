import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import path from 'node:path';

/**
 * Prisma CLI configuration.
 *
 * Giving the CLI the same libSQL adapter the app uses means `prisma db push`,
 * `migrate` and `studio` talk to whichever database is configured - a remote
 * Turso database when TURSO_DATABASE_URL is set, otherwise the local SQLite
 * file. Without this the CLI could only ever reach a local file.
 *
 * Note: this uses Prisma's JavaScript schema engine, which Prisma still labels
 * unstable. If a schema command misbehaves against Turso, fall back to
 * `npm run db:sql` and apply the emitted SQL with the Turso CLI - see README.
 */
function adapter() {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();

  if (tursoUrl) {
    return new PrismaLibSQL({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined,
    });
  }

  // Mirrors src/lib/db.ts: a relative file: URL is resolved against prisma/,
  // matching how Prisma itself interprets it in the schema.
  const local = process.env.DATABASE_URL?.trim() || 'file:./dev.db';
  const target = local.slice('file:'.length);
  const resolved = path.isAbsolute(target) ? target : path.resolve(process.cwd(), 'prisma', target);

  return new PrismaLibSQL({ url: `file:${resolved}` });
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  experimental: { adapter: true },
  engine: 'js',
  adapter: async () => adapter(),
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
