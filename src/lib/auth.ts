import NextAuth, { type DefaultSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from './db';
import { slugify } from './ids';

/**
 * Auth.js (NextAuth v5).
 *
 * Email + password is the default so the app runs locally with no third-party
 * setup; GitHub OAuth activates automatically when its credentials are present.
 * Sessions are JWTs because the credentials provider requires it.
 *
 * Every user gets a personal Workspace on first sign-in. All tenant data hangs
 * off a workspace, which is what makes team and agency workspaces a later
 * feature rather than a rewrite.
 */

declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user'];
  }
}

export const credentialsSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().max(80).optional(),
});

/**
 * Social providers turn themselves on when their credentials are present.
 *
 * Nothing is required: the app still runs on email and password alone, which is
 * what keeps a local checkout and a self-hosted install working with no
 * third-party setup at all.
 */
const githubEnabled = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);
const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  // Route Auth.js failures to our own page. Its default error screen says
  // only "there is a problem with the server configuration", which gives a
  // visitor nothing and an operator no indication of which variable is missing.
  pages: { signIn: '/signin', error: '/signin' },
  trustHost: true,
  providers: [
    ...(githubEnabled ? [GitHub] : []),
    ...(googleEnabled
      ? [
          Google({
            // Google refuses to re-issue a refresh token on a repeat consent
            // unless it is asked to, which makes an account that was linked
            // once impossible to re-link cleanly later.
            authorization: { params: { prompt: 'consent', access_type: 'offline', response_type: 'code' } },
          }),
        ]
      : []),
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id) await ensureWorkspace(user.id, user.name ?? user.email ?? 'My workspace');
    },
  },
});

export const AUTH_PROVIDERS = { github: githubEnabled, google: googleEnabled };

/** Idempotent: creates the user's personal workspace the first time they sign in. */
export async function ensureWorkspace(userId: string, label: string) {
  const existing = await db.membership.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  });
  if (existing) return existing.workspace;

  const base = slugify(label, 'workspace');
  let slug = base;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const taken = await db.workspace.findUnique({ where: { slug } });
    if (!taken) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  return db.workspace.create({
    data: {
      name: label.includes('@') ? `${label.split('@')[0]}'s workspace` : `${label}'s workspace`,
      slug,
      members: { create: { userId, role: 'OWNER' } },
    },
  });
}

export async function registerUser(input: z.infer<typeof credentialsSchema>) {
  const email = input.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw new Error('An account with that email already exists.');

  const user = await db.user.create({
    data: {
      email,
      name: input.name?.trim() || email.split('@')[0],
      passwordHash: await bcrypt.hash(input.password, 12),
    },
  });

  await ensureWorkspace(user.id, user.name ?? email);
  return user;
}
