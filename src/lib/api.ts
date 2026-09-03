import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthError, ForbiddenError } from './tenancy';
import { OperationError } from './website/operations';
import { LlmError } from './ai/types';
import { VercelError } from './deploy/vercel';

/**
 * Route handler plumbing.
 *
 * One place that turns a thrown domain error into the right HTTP status, so
 * routes read as business logic and error shapes stay consistent for the
 * client. Internal details are never echoed to the browser for a 500.
 */

export type ApiError = { error: string; details?: unknown };

export function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json<ApiError>({ error: message, ...(details ? { details } : {}) }, { status });
}

/**
 * Recognises failures that come from below the application: the database
 * driver, the query engine, the connection. Their messages are diagnostic
 * rather than actionable, so they are logged and replaced.
 */
function isInternalError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  // Prisma's client error classes all follow this naming, and the driver
  // adapter surfaces raw libSQL/SQLite errors through them.
  if (error.name.startsWith('PrismaClient')) return true;

  return /prisma\.|Invalid `|ConnectorError|SqliteError|SQLITE_|LibsqlError|no such table/i.test(error.message);
}

export function toErrorResponse(error: unknown) {
  if (error instanceof AuthError) return jsonError(error.message, 401);
  if (error instanceof ForbiddenError) return jsonError(error.message, 404);
  if (error instanceof OperationError) return jsonError(error.message, 422);
  if (error instanceof ZodError) {
    return jsonError('That request was not valid.', 400, error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })));
  }
  if (error instanceof VercelError) return jsonError(error.message, error.status && error.status < 500 ? 400 : 502);
  if (error instanceof LlmError) return jsonError(`AI provider error: ${error.message}`, 502);

  // Infrastructure failures must never reach the browser. A Prisma error
  // carries the query, the driver internals and the schema shape - none of
  // which helps a visitor, and all of which is better kept server-side.
  if (isInternalError(error)) {
    console.error('[api] internal', error);
    return jsonError('Something went wrong on our end. Please try again.', 500);
  }

  if (error instanceof Error) {
    // Domain errors thrown with `new Error(...)` are user-facing by
    // convention; anything else is handled above.
    console.error('[api]', error);
    return jsonError(error.message || 'Something went wrong.', 400);
  }

  console.error('[api] unknown error', error);
  return jsonError('Something went wrong.', 500);
}

/** Wraps a handler so every route gets the same error mapping. */
export function handle<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error('Expected a JSON body.');
  }
}
