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
    throw new VercelError(error?.message ?? `Vercel responded ${response.status}`, response.status, error?.code);
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
