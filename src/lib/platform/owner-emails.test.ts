import { describe, expect, it } from 'vitest';
import { emailMatches, parseOwnerEmails } from './owner-emails';

/**
 * Who the console lets in.
 *
 * Worth testing precisely because every way of getting this wrong looks the
 * same from outside: a 404, identical to the one a stranger gets. There is no
 * message to read and nothing in the interface to correct, so a parsing mistake
 * here is found by an owner who cannot open their own console and has no way to
 * tell that from being refused.
 *
 * Tested through the pure functions rather than by setting `OWNER_EMAILS`.
 * `process.env` is shared by every test file running in the same process, so a
 * suite that writes to it passes alone and fails at random alongside others.
 */

const owners = (raw: string | null | undefined) => parseOwnerEmails(raw);
const admits = (raw: string, email: string) => emailMatches(parseOwnerEmails(raw), email);

describe('reading the owner list', () => {
  it('takes a single address', () => {
    expect(owners('owner@example.com')).toEqual(['owner@example.com']);
  });

  it('takes several, however they are spaced', () => {
    expect(owners('one@example.com,  two@example.com ,three@example.com')).toEqual([
      'one@example.com',
      'two@example.com',
      'three@example.com',
    ]);
  });

  it('matches regardless of case, since these addresses are not case sensitive', () => {
    expect(admits('Owner@Example.COM', 'owner@example.com')).toBe(true);
    expect(admits('owner@example.com', 'OWNER@EXAMPLE.COM')).toBe(true);
  });

  /**
   * The failure this file exists for. A `.env` file wants the quoted form; a
   * hosting dashboard stores the literal characters typed into the box. Pasting
   * one into the other produced an address containing quote marks, which
   * matched nobody and looked exactly like being refused.
   */
  it('ignores quotes carried over from a .env file', () => {
    expect(admits('"owner@example.com"', 'owner@example.com')).toBe(true);
    expect(admits("'owner@example.com'", 'owner@example.com')).toBe(true);
  });

  it('ignores quotes around a list, and around each address within one', () => {
    expect(owners('"one@example.com,two@example.com"')).toEqual(['one@example.com', 'two@example.com']);
    expect(owners('"one@example.com", "two@example.com"')).toEqual(['one@example.com', 'two@example.com']);
  });

  it('does not repeat an address listed twice', () => {
    expect(owners('owner@example.com,Owner@example.com')).toEqual(['owner@example.com']);
  });

  it('drops empty entries rather than admitting a blank', () => {
    expect(owners('owner@example.com,,  ,')).toEqual(['owner@example.com']);
    expect(emailMatches(['owner@example.com'], '')).toBe(false);
    expect(emailMatches(['owner@example.com'], null)).toBe(false);
    expect(emailMatches(['owner@example.com'], undefined)).toBe(false);
  });
});

describe('when nothing is configured', () => {
  it.each([undefined, null, '', '   ', '""', "''", ',,'])('treats %o as nobody', (value) => {
    expect(owners(value)).toEqual([]);
    expect(emailMatches(owners(value), 'anyone@example.com')).toBe(false);
  });
});

describe('who is refused', () => {
  it('refuses an address that merely contains an owner address', () => {
    expect(admits('owner@example.com', 'notowner@example.com')).toBe(false);
    expect(admits('owner@example.com', 'owner@example.com.attacker.test')).toBe(false);
    expect(admits('owner@example.com', 'owner@example.co')).toBe(false);
  });
});
