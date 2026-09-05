import { currentUser, type SessionUser } from '@/lib/tenancy';
import { isOwnerEmail } from './owner-emails';

// Re-exported so a caller that only needs the list can import either module,
// while callers that need the session keep importing this one.
export { isOwnerConfigured, isOwnerEmail, ownerEmails } from './owner-emails';

/**
 * Who may open the owner console.
 *
 * Held in the environment rather than as a flag on the user row, and that is a
 * deliberate trade. A database flag is only ever as safe as every write path
 * that can reach it: one over-permissive update, one seeded fixture, one
 * mass-assignment in a route that spreads a request body into `data`, and an
 * account promotes itself. An environment variable has no write path at all -
 * changing who is an owner requires access to the hosting configuration, which
 * is the level of access the console itself confers.
 *
 * The cost is that adding an owner needs a redeploy. For a console that can
 * change everyone's plan and halt generation, that is the right way round.
 */

export class NotOwnerError extends Error {
  /**
   * 404, not 403. An owner console that answers "forbidden" confirms it exists
   * and that the address is right; one that answers "not found" tells an
   * unauthenticated prober nothing they did not already have.
   */
  readonly status = 404;

  constructor() {
    super('Not found.');
    this.name = 'NotOwnerError';
  }
}


/** The signed-in user if they own the platform, otherwise null. */
export async function currentOwner(): Promise<SessionUser | null> {
  const user = await currentUser();
  if (!user || !isOwnerEmail(user.email)) return null;
  return user;
}

/**
 * The signed-in owner, or a 404.
 *
 * Guards both the console pages and every route behind them - the pages alone
 * would leave the data one fetch away for anyone who guessed the paths.
 */
export async function requireOwner(): Promise<SessionUser> {
  const owner = await currentOwner();
  if (!owner) throw new NotOwnerError();
  return owner;
}
