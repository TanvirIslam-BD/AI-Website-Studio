/**
 * Collision-resistant, URL-safe ids generated on both server and client.
 * Section/page ids are created in the editor before they ever reach the
 * database, so they cannot rely on Prisma defaults.
 */
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

export function createId(prefix = ''): string {
  const bytes =
    typeof globalThis.crypto?.getRandomValues === 'function'
      ? globalThis.crypto.getRandomValues(new Uint8Array(12))
      : Uint8Array.from({ length: 12 }, () => Math.floor(Math.random() * 256));
  let out = '';
  for (const byte of bytes) out += ALPHABET[byte % ALPHABET.length];
  return prefix ? `${prefix}_${out}` : out;
}

export function slugify(input: string, fallback = 'page'): string {
  const slug = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || fallback;
}
