/**
 * Input limits shared by the API routes and the UI that feeds them.
 *
 * Kept in its own dependency-free module on purpose. The server enforces these
 * and the client shows them, so both need the same number - but a client
 * component importing it from `lib/ai` would pull the provider SDKs into the
 * browser bundle. Nothing here imports anything.
 */

/**
 * How long a website brief may be.
 *
 * A real design brief - brand, palette, section-by-section direction - runs to
 * several thousand characters, and accepting one is the whole point of the
 * product. The previous 2000-character ceiling rejected those before a single
 * token reached the model. This limit is about the user's intent rather than
 * the provider's: at roughly 4k tokens a full brief still leaves every
 * supported model ample room for its 16k-token response.
 */
export const MAX_BRIEF_LENGTH = 16000;
