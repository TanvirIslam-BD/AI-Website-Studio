/**
 * Reading the owner list, and nothing else.
 *
 * Separate from `./owner` so that asking "who is an owner" costs nothing.
 * `owner.ts` resolves the *current* owner, which needs the session, which pulls
 * in Auth.js - right for the console, wrong for `/api/health`, which reports on
 * configuration and has to keep working when the rest of the app cannot. This
 * file imports nothing.
 *
 * The parsing is a pure function over a string, with the environment read in
 * one place on top of it. That is what makes it testable without writing to
 * `process.env`, which is shared by every test running in the same process.
 */

/** Strips one layer of surrounding quotes, in either style. */
const unquote = (value: string) => value.trim().replace(/^["']|["']$/g, '');

/**
 * Splits a configured value into addresses, lower-cased and de-duplicated.
 *
 * Quotes are stripped, around the whole value and around each address. A
 * `.env` file wants `OWNER_EMAILS="a@b.com"`; a hosting dashboard stores
 * exactly what is typed into the box, so pasting the quoted form there produces
 * an address with literal quote characters in it. That matches nobody, and the
 * failure is invisible - the console 404s exactly as it does for a stranger, so
 * nothing tells an owner they configured it wrong rather than being refused.
 */
export function parseOwnerEmails(raw: string | null | undefined): string[] {
  const value = unquote(raw ?? '');

  return Array.from(new Set(value.split(',').map((entry) => unquote(entry).toLowerCase()).filter(Boolean)));
}

/** Whether an address is in a parsed list. Exact match, never a prefix. */
export function emailMatches(owners: readonly string[], email: string | null | undefined): boolean {
  if (!email) return false;
  return owners.includes(unquote(email).toLowerCase());
}

/** Owner addresses, from the environment. */
export function ownerEmails(): string[] {
  return parseOwnerEmails(process.env.OWNER_EMAILS);
}

/** True when the platform has any owner configured at all. */
export function isOwnerConfigured(): boolean {
  return ownerEmails().length > 0;
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  return emailMatches(ownerEmails(), email);
}
