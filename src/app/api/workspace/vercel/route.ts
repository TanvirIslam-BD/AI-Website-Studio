import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handle, readJson } from '@/lib/api';
import { requireUser, requireWorkspace } from '@/lib/tenancy';
import { connectWorkspace, connectionStatus, disconnectWorkspace } from '@/lib/deploy/credentials';

export const runtime = 'nodejs';

/**
 * A workspace's Vercel connection.
 *
 * Deliberately never returns the token, only a four-character hint and the
 * account it belongs to - enough for someone to recognise which credential is
 * stored without the value being readable back out of the product.
 */

export const GET = handle(async () => {
  const user = await requireUser();
  const workspace = await requireWorkspace(user.id);
  return NextResponse.json(await connectionStatus(workspace.id));
});

const connectSchema = z.object({
  token: z.string().min(10, 'That does not look like a Vercel access token.').max(200),
  /** Only needed when the token belongs to a team rather than a personal account. */
  teamId: z.string().max(80).optional(),
});

export const POST = handle(async (request: Request) => {
  const user = await requireUser();
  const workspace = await requireWorkspace(user.id);
  const input = connectSchema.parse(await readJson(request));

  const { status, check } = await connectWorkspace({
    workspaceId: workspace.id,
    userId: user.id,
    token: input.token,
    teamId: input.teamId,
  });

  return NextResponse.json({ ...status, accountName: check.accountName });
});

export const DELETE = handle(async () => {
  const user = await requireUser();
  const workspace = await requireWorkspace(user.id);
  return NextResponse.json(await disconnectWorkspace(workspace.id));
});
