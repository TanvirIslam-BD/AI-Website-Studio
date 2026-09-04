import { db } from '@/lib/db';
import { decryptSecret, encryptSecret, isEncryptionConfigured, secretHint } from '@/lib/crypto';
import { checkToken, platformCredentials, type TokenCheck, type VercelCredentials } from './vercel';

/**
 * Whose Vercel account a workspace deploys to.
 *
 * Resolution order is deliberate: the workspace's own connection wins, so a
 * customer's site lands in the account they can actually administer. The
 * platform's environment token is only a fallback, which keeps self-hosting
 * and local development working without a connect step.
 *
 * Kept separate from vercel.ts on purpose - that module talks to Vercel and
 * knows nothing about the database, which is what makes it swappable for
 * another host.
 */

export type ConnectionSource = 'workspace' | 'platform';

export type ResolvedCredentials = {
  credentials: VercelCredentials;
  source: ConnectionSource;
  accountName: string | null;
};

export async function resolveCredentials(workspaceId: string): Promise<ResolvedCredentials | null> {
  const connection = await db.hostingConnection.findUnique({ where: { workspaceId } });

  if (connection) {
    return {
      credentials: { token: decryptSecret(connection.token), teamId: connection.teamId ?? undefined },
      source: 'workspace',
      accountName: connection.accountName,
    };
  }

  const platform = platformCredentials();
  return platform ? { credentials: platform, source: 'platform', accountName: null } : null;
}

export type ConnectionStatus = {
  connected: boolean;
  source: ConnectionSource | null;
  accountName: string | null;
  tokenHint: string | null;
  teamId: string | null;
  verifiedAt: string | null;
  /** False when ENCRYPTION_KEY is missing, which blocks connecting at all. */
  canConnect: boolean;
};

export async function connectionStatus(workspaceId: string): Promise<ConnectionStatus> {
  const connection = await db.hostingConnection.findUnique({ where: { workspaceId } });
  const canConnect = isEncryptionConfigured();

  if (connection) {
    return {
      connected: true,
      source: 'workspace',
      accountName: connection.accountName,
      tokenHint: connection.tokenHint,
      teamId: connection.teamId,
      verifiedAt: connection.verifiedAt?.toISOString() ?? null,
      canConnect,
    };
  }

  const platform = platformCredentials();
  return {
    connected: Boolean(platform),
    source: platform ? 'platform' : null,
    accountName: null,
    tokenHint: null,
    teamId: null,
    verifiedAt: null,
    canConnect,
  };
}

/**
 * Stores a workspace's credential, after confirming it actually works.
 *
 * Verifying before saving matters: a token that cannot create projects fails
 * only at deploy time otherwise, long after the user has moved on from the
 * screen where they could fix it.
 */
export async function connectWorkspace(input: {
  workspaceId: string;
  userId: string;
  token: string;
  teamId?: string;
}): Promise<{ status: ConnectionStatus; check: TokenCheck }> {
  const token = input.token.trim();
  const teamId = input.teamId?.trim() || undefined;

  if (!token) throw new Error('A Vercel access token is required.');
  if (!isEncryptionConfigured()) {
    throw new Error('ENCRYPTION_KEY is not configured on the server, so credentials cannot be stored securely.');
  }

  const check = await checkToken({ token, teamId });
  if (!check.usable) {
    throw new Error(check.reason ?? 'Vercel rejected that token.');
  }

  const data = {
    provider: 'vercel',
    token: encryptSecret(token),
    tokenHint: secretHint(token),
    teamId: teamId ?? null,
    accountName: check.accountName,
    verifiedAt: new Date(),
  };

  await db.hostingConnection.upsert({
    where: { workspaceId: input.workspaceId },
    create: { workspaceId: input.workspaceId, createdById: input.userId, ...data },
    update: data,
  });

  return { status: await connectionStatus(input.workspaceId), check };
}

export async function disconnectWorkspace(workspaceId: string): Promise<ConnectionStatus> {
  await db.hostingConnection.deleteMany({ where: { workspaceId } });
  return connectionStatus(workspaceId);
}
