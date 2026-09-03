import { Prisma } from '@prisma/client';
import { auth, ensureWorkspace } from './auth';
import { db } from './db';

/**
 * Tenancy helpers.
 *
 * Every read and write of project data goes through one of these, so a request
 * can only ever touch data in a workspace the signed-in user belongs to. That
 * check lives here rather than in each route, which is what keeps the
 * multi-tenant boundary auditable.
 */

export class AuthError extends Error {
  readonly status = 401;
  constructor(message = 'You need to be signed in.') {
    super(message);
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends Error {
  readonly status = 404;
  constructor(message = 'Not found.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export type SessionUser = { id: string; email: string; name: string | null; image: string | null };

export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? null,
    image: session.user.image ?? null,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new AuthError();
  return user;
}

/** The user's active workspace. Created on demand so sign-up can never race. */
export async function requireWorkspace(userId: string) {
  const membership = await db.membership.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  });
  if (membership) return membership.workspace;

  const user = await db.user.findUnique({ where: { id: userId } });
  return ensureWorkspace(userId, user?.name ?? user?.email ?? 'My workspace');
}

const PROJECT_INCLUDE = {
  theme: true,
  // Timestamps can tie within a single save, so id breaks the tie and keeps
  // the document byte-stable across reloads.
  assets: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] },
  pages: {
    orderBy: { position: 'asc' },
    include: { sections: { orderBy: { position: 'asc' } } },
  },
} satisfies Prisma.ProjectInclude;

/**
 * Loads a project with its full content graph, but only if the caller's
 * workspace owns it. A project in another workspace is reported as missing
 * rather than forbidden, so ids cannot be probed.
 */
export async function requireProject(projectId: string, userId: string) {
  const project = await db.project.findFirst({
    where: { id: projectId, workspace: { members: { some: { userId } } } },
    include: PROJECT_INCLUDE,
  });
  if (!project) throw new ForbiddenError('Project not found.');
  return project;
}

export type ProjectWithContent = Awaited<ReturnType<typeof requireProject>>;

/** Lightweight variant for endpoints that only need ownership + status. */
export async function requireProjectRef(projectId: string, userId: string) {
  const project = await db.project.findFirst({
    where: { id: projectId, workspace: { members: { some: { userId } } } },
    select: { id: true, name: true, slug: true, status: true, workspaceId: true, productionUrl: true, description: true },
  });
  if (!project) throw new ForbiddenError('Project not found.');
  return project;
}

export { PROJECT_INCLUDE };
