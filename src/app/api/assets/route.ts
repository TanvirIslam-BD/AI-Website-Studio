import { NextResponse } from 'next/server';
import { handle } from '@/lib/api';
import { requireUser } from '@/lib/tenancy';
import { availableProviders, searchImages } from '@/lib/assets';

export const runtime = 'nodejs';

/** Image search for the editor's asset panel. */
export const GET = handle(async (request: Request) => {
  await requireUser();
  const url = new URL(request.url);
  const query = url.searchParams.get('q') ?? '';
  const count = Math.min(Number(url.searchParams.get('count') ?? 12) || 12, 24);

  const { results, provider } = await searchImages(query, count);
  return NextResponse.json({
    results,
    provider,
    providers: availableProviders().map((p) => ({ id: p.id, label: p.label })),
  });
});
