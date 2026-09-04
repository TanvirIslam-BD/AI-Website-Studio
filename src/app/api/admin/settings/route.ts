import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handle, readJson } from '@/lib/api';
import { requireOwner } from '@/lib/platform/owner';
import { platformSettings, savePlatformSettings } from '@/lib/platform/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Platform controls.
 *
 * Guarded by `requireOwner` in its own right, not only by the console page in
 * front of it. A page-level check leaves the controls one fetch away for
 * anyone who reads the client bundle and guesses the path.
 */

export const GET = handle(async () => {
  await requireOwner();
  return NextResponse.json(await platformSettings());
});

const patchSchema = z.object({
  generationMode: z.enum(['auto', 'ai', 'template']).optional(),
  generationPaused: z.boolean().optional(),
  signupsPaused: z.boolean().optional(),
  notice: z.string().max(280).nullable().optional(),
});

export const PATCH = handle(async (request: Request) => {
  const owner = await requireOwner();
  const input = patchSchema.parse(await readJson(request));
  return NextResponse.json(await savePlatformSettings(input, owner.id));
});
