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

/**
 * Whose account a deployment goes to.
 *
 * Passed in rather than read from the environment: each workspace deploys with
 * its own credential, so the caller resolves whose it is. The platform's own
 * environment token remains only as a fallback for self-hosting and local
 * development - see src/lib/deploy/credentials.ts.
 */
export type VercelCredentials = {
  token: string;
  /** Required on every request when the credential belongs to a team. */
  teamId?: string;
};

/** The platform-wide fallback, for self-hosting and local development. */
export function platformCredentials(): VercelCredentials | null {
  const token = process.env.VERCEL_TOKEN?.trim();
  if (!token) return null;
  return { token, teamId: process.env.VERCEL_TEAM_ID?.trim() || undefined };
}

export function isVercelConfigured(): boolean {
  return platformCredentials() !== null;
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

async function request<T>(path: string, credentials: VercelCredentials, init?: RequestInit): Promise<T> {
  const { token, teamId } = credentials;
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
  credentials: VercelCredentials;
}): Promise<VercelDeployment> {
  const raw = await request<RawDeployment>('/v13/deployments?skipAutoDetectionConfirmation=1', options.credentials, {
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

export async function getDeployment(
  deploymentId: string,
  credentials: VercelCredentials,
): Promise<VercelDeployment> {
  return normalize(
    await request<RawDeployment>(`/v13/deployments/${encodeURIComponent(deploymentId)}`, credentials),
  );
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

export type TokenCheck = { usable: boolean; accountName: string | null; scope: string | null; reason: string | null };

/**
 * Validates a credential and resolves whose account it belongs to.
 *
 * Reading the account is the probe that matters: a project-scoped or read-only
 * token can list projects perfectly well and still be refused when a first
 * deployment tries to create one, which produced a false all-clear when this
 * checked /v9/projects instead.
 *
 * Never throws. Used both to verify a token at the moment a user connects it,
 * and advisorily before a deploy - the mapping from token type to permission is
 * not documented exhaustively, so a token that fails this might still work.
 */
export async function checkToken(credentials: VercelCredentials | null): Promise<TokenCheck> {
  if (!credentials) {
    return { usable: false, accountName: null, scope: null, reason: 'No Vercel account is connected.' };
  }

  try {
    const me = await request<{ user?: { username?: string; email?: string } }>('/v2/user', credentials);
    const accountName = me.user?.username ?? me.user?.email ?? null;
    return {
      usable: true,
      accountName,
      scope: credentials.teamId ? `team ${credentials.teamId}` : 'personal account',
      reason: null,
    };
  } catch (error) {
    if (error instanceof VercelError && [401, 403, 404].includes(error.status ?? 0)) {
      return {
        usable: false,
        accountName: null,
        scope: null,
        reason:
          'Vercel did not recognise this as an account token, which usually means it is project-scoped or read-only. Deploying a new site needs a token that can create projects. If it belongs to a team, the team ID is required too.',
      };
    }
    // A network blip or Vercel outage is not a credential problem.
    return { usable: true, accountName: null, scope: null, reason: null };
  }
}
