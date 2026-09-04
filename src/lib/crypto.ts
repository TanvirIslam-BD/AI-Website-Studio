import crypto from 'node:crypto';

/**
 * Symmetric encryption for third-party credentials at rest.
 *
 * A user's Vercel token can create projects and deployments in their account,
 * so it must never sit in the database in plaintext. AES-256-GCM is used
 * rather than CBC because it authenticates the ciphertext: tampering fails
 * loudly at decrypt instead of yielding a silently corrupted token.
 *
 * The stored form is `v1:<iv>:<tag>:<ciphertext>`, all base64url. The version
 * prefix exists so the key can be rotated later without having to guess what
 * an old row was encrypted with.
 */

const VERSION = 'v1';
const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12; // 96 bits, the size GCM is specified for
const KEY_BYTES = 32;

function key(): Buffer {
  const raw = process.env.ENCRYPTION_KEY?.trim();
  if (!raw) {
    throw new Error(
      'ENCRYPTION_KEY is not set. It is required to store third-party credentials. Generate one with: openssl rand -base64 32',
    );
  }

  const decoded = Buffer.from(raw, 'base64');
  if (decoded.length !== KEY_BYTES) {
    throw new Error(
      `ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes (got ${decoded.length}). Generate one with: openssl rand -base64 32`,
    );
  }
  return decoded;
}

/** True when a usable key is configured, for health checks and setup guards. */
export function isEncryptionConfigured(): boolean {
  try {
    key();
    return true;
  } catch {
    return false;
  }
}

export function encryptSecret(plaintext: string): string {
  if (!plaintext) throw new Error('Refusing to encrypt an empty value.');

  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

  return [VERSION, iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), ciphertext.toString('base64url')].join(
    ':',
  );
}

export function decryptSecret(stored: string): string {
  const parts = stored.split(':');
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error('Stored credential is not in a recognised format.');
  }

  const [, iv, tag, ciphertext] = parts;
  const decipher = crypto.createDecipheriv(ALGORITHM, key(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));

  // Throws if the ciphertext or tag was altered, or the key is wrong.
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8');
}

/** A non-reversible hint for the UI, so a stored token can be recognised. */
export function secretHint(plaintext: string): string {
  return plaintext.length <= 8 ? '•'.repeat(plaintext.length) : `${'•'.repeat(4)}${plaintext.slice(-4)}`;
}
