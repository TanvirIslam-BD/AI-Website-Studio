import type { GeneratedFile } from './codegen';

/**
 * Vercel deployment client.
 *
 * Isolated from the rest of the app on purpose: it is the only module that
 * talks to Vercel, it never sees a database row, and swapping in another host
 * (Netlify, Cloudflare Pages, S3) means implementing this one interface.
 *
 * Uses the v13 inline-files API - generated sites are a handful of small text
 * files, so there is no need for the sha1 upload dance.
 */

const API = 'https://api.vercel.com';

export type VercelReadyState = 'QUEUED' | 'INITIALIZING' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';

export type VercelDeployment = {
  id: string;
  url: string | null;
  inspectorUrl: string | null;
  readyState: VercelReadyState;
  errorMessage?: string | null;
  aliases: string[];
  createdAt?: number;
  readyAt?: number | null;
};

export class VercelError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'VercelError';
  }
}

export function isVercelConfigured(): boolean {
  return Boolean(process.env.VERCEL_TOKEN?.trim());
}

function credentials(): { token: string; teamId?: string } {
  const token = process.env.VERCEL_TOKEN?.trim();
  if (!token) {
    throw new VercelError(
      'Vercel is not configured. Add VERCEL_TOKEN (and VERCEL_TEAM_ID for team accounts) to your environment.',
      400,
      'not_configured',
    );
  }
  return { token, teamId: process.env.VERCEL_TEAM_ID?.trim() || undefined };
}

/**
 * Turns Vercel's own wording into something actionable.
 *
 * A permission failure is almost always one of two setup problems rather than
 * anything about the request, and its message names neither: a token that is
 * project-scoped or read-only cannot create the project a first deployment
 * needs, and a token issued under a team is refused in the personal scope
 * unless VERCEL_TEAM_ID is also set.
 */
function explain(message: string, status: number, teamId?: string): string {
  if (status !== 403 && status !== 401) return message;

  const causes = [
    'the token is project-scoped or read-only - deploying a new site needs a token that can create projects, from vercel.com/account/tokens',
    teamId
      ? `the token may not belong to the team in VERCEL_TEAM_ID (${teamId})`
      : 'if the token was issued under a team rather than a personal account, VERCEL_TEAM_ID must be set as well',
  ];

  return `${message} Two things cause this: ${causes.join('; or ')}.`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { token, teamId } = credentials();
  const url = new URL(`${API}${path}`);
  if (teamId) url.searchParams.set('teamId', teamId);

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: { message: text.slice(0, 400) } };
    }
  }

  if (!response.ok) {
    const error = (payload as { error?: { message?: string; code?: string } } | null)?.error;
    const message = error?.message ?? `Vercel responded ${response.status}`;
    throw new VercelError(explain(message, response.status, teamId), response.status, error?.code);
  }

  return payload as T;
}

type RawDeployment = {
  id: string;
  url?: string;
  inspectorUrl?: string;
  readyState?: VercelReadyState;
  status?: VercelReadyState;
  alias?: string[];
  aliasAssigned?: boolean;
  createdAt?: number;
  ready?: number;
  errorMessage?: string;
  errorCode?: string;
};

function normalize(raw: RawDeployment): VercelDeployment {
  return {
    id: raw.id,
    url: raw.url ? `https://${raw.url.replace(/^https?:\/\//, '')}` : null,
    inspectorUrl: raw.inspectorUrl ?? null,
    readyState: raw.readyState ?? raw.status ?? 'QUEUED',
    errorMessage: raw.errorMessage ?? null,
    aliases: (raw.alias ?? []).map((alias) => `https://${alias.replace(/^https?:\/\//, '')}`),
    createdAt: raw.createdAt,
    readyAt: raw.ready ?? null,
  };
}

/**
 * Vercel project names: lowercase, alphanumeric and dashes, <= 100 chars.
 * The name is what ties repeat deployments to the same Vercel project, so it
 * must be derived deterministically from the studio project.
 */
export function vercelProjectName(slug: string, projectId: string): string {
  const base = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'site';
  const suffix = projectId.toLowerCase().replace(/[^a-z0-9]/g, '').slice(-6);
  return `${base}-${suffix}`.slice(0, 90);
}

export async function createDeployment(options: {
  name: string;
  files: GeneratedFile[];
  target?: 'production' | 'preview';
}): Promise<VercelDeployment> {
  const raw = await request<RawDeployment>('/v13/deployments?skipAutoDetectionConfirmation=1', {
    method: 'POST',
    body: JSON.stringify({
      name: options.name,
      target: options.target ?? 'production',
      files: options.files.map((file) => ({ file: file.file, data: file.data, encoding: 'utf-8' })),
      // A generated site is pre-built static output: no framework, no build.
      projectSettings: {
        framework: null,
        buildCommand: null,
        installCommand: null,
        devCommand: null,
        outputDirectory: null,
      },
    }),
  });

  return normalize(raw);
}

export async function getDeployment(deploymentId: string): Promise<VercelDeployment> {
  return normalize(await request<RawDeployment>(`/v13/deployments/${encodeURIComponent(deploymentId)}`));
}

/**
 * The stable production URL, once Vercel has assigned aliases.
 *
 * Vercel returns several: the immutable per-deployment hostname (which carries
 * a hash segment), branch aliases containing "-git-", and the clean production
 * alias. Only the last one is worth showing a user.
 */
export function productionUrlFor(deployment: VercelDeployment): string | null {
  const isHashed = (value: string) => /-[a-z0-9]{9}\./.test(value);
  const isBranch = (value: string) => value.includes('-git-');

  return (
    deployment.aliases.find((value) => !isHashed(value) && !isBranch(value)) ??
    deployment.aliases.find((value) => !isHashed(value)) ??
    deployment.aliases[0] ??
    deployment.url
  );
}

export type TokenCheck = { usable: boolean; scope: string | null; reason: string | null };

/**
 * Preflight for the deploy panel.
 *
 * Probing with a project listing was misleading: a project-scoped token can
 * list projects perfectly well and still be refused when a first deployment
 * tries to create one, which produced a false all-clear. Reading the account
 * is the signal that actually separated them - a full-access token returns the
 * user, a restricted one answers 404 or 403.
 *
 * Advisory only, and never throws. The mapping from token type to permission
 * is not documented exhaustively, so a token that fails this check might still
 * deploy; the panel warns but does not block, because a wrong refusal is worse
 * than a wrong warning.
 */
export async function checkToken(): Promise<TokenCheck> {
  if (!isVercelConfigured()) {
    return { usable: false, scope: null, reason: 'No VERCEL_TOKEN is configured.' };
  }

  try {
    await request<{ user: { username: string } }>('/v2/user');
    const teamId = process.env.VERCEL_TEAM_ID?.trim();
    return { usable: true, scope: teamId ? `team ${teamId}` : 'personal account', reason: null };
  } catch (error) {
    if (error instanceof VercelError && [401, 403, 404].includes(error.status ?? 0)) {
      return {
        usable: false,
        scope: null,
        reason:
          'Vercel does not recognise this token as an account token, which usually means it is project-scoped or read-only. Deploying a new site needs a token that can create projects. If the token belongs to a team, VERCEL_TEAM_ID must be set too.',
      };
    }
    // A network blip or Vercel outage is not a token problem.
    return { usable: true, scope: null, reason: null };
  }
}
