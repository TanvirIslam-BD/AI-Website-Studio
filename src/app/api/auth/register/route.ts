import { NextResponse } from 'next/server';
import { credentialsSchema, registerUser } from '@/lib/auth';
import { handle, readJson } from '@/lib/api';

export const runtime = 'nodejs';

export const POST = handle(async (request: Request) => {
  const body = credentialsSchema.parse(await readJson(request));
  const user = await registerUser(body);
  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
});
