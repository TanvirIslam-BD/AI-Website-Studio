'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';
import { AlertCircle, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { errorMessage } from '@/lib/utils';

export function AuthForm({
  mode,
  prompt,
  githubEnabled,
  error: initialError,
}: {
  mode: 'signin' | 'register';
  prompt?: string;
  githubEnabled: boolean;
  error?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(
    initialError ? 'That sign-in attempt did not work. Please try again.' : null,
  );

  const next = prompt ? `/dashboard?prompt=${encodeURIComponent(prompt)}` : '/dashboard';

  async function submit(formData: FormData) {
    setError(null);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');
    const name = String(formData.get('name') ?? '');

    try {
      if (mode === 'register') {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? 'Could not create that account.');
        }
      }

      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) throw new Error('Incorrect email or password.');

      startTransition(() => {
        router.push(next);
        router.refresh();
      });
    } catch (caught) {
      setError(errorMessage(caught, 'Could not sign you in.'));
    }
  }

  return (
    <div className="mt-8">
      {githubEnabled ? (
        <>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full justify-center"
            onClick={() => signIn('github', { redirectTo: next })}
          >
            <Github className="h-4 w-4" /> Continue with GitHub
          </Button>
          <div className="my-6 flex items-center gap-3 text-xs text-ink-400">
            <span className="h-px flex-1 bg-ink-200" /> or <span className="h-px flex-1 bg-ink-200" />
          </div>
        </>
      ) : null}

      <form
        action={(formData) => {
          void submit(formData);
        }}
        className="grid gap-4"
      >
        {mode === 'register' ? (
          <Field label="Name">
            <Input name="name" autoComplete="name" placeholder="Jane Doe" />
          </Field>
        ) : null}
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
        </Field>
        <Field label="Password" hint={mode === 'register' ? 'At least 8 characters.' : undefined}>
          <Input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            placeholder="••••••••"
          />
        </Field>

        {error ? (
          <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="primary" size="lg" loading={pending} className="w-full justify-center">
          {mode === 'register' ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-500">
        {mode === 'register' ? 'Already have an account? ' : 'New here? '}
        <Link
          href={{ pathname: '/signin', query: { ...(mode === 'register' ? {} : { mode: 'register' }), ...(prompt ? { prompt } : {}) } }}
          className="font-medium text-ink-900 underline underline-offset-4"
        >
          {mode === 'register' ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </div>
  );
}
