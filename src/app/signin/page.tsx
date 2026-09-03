import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AUTH_PROVIDERS } from '@/lib/auth';
import { currentUser } from '@/lib/tenancy';
import { Logo } from '@/components/ui/misc';
import { AuthForm } from './auth-form';

export const metadata = { title: 'Sign in' };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; prompt?: string; error?: string }>;
}) {
  const params = await searchParams;
  const user = await currentUser();

  if (user) {
    redirect(params.prompt ? `/dashboard?prompt=${encodeURIComponent(params.prompt)}` : '/dashboard');
  }

  const mode = params.mode === 'register' ? 'register' : 'signin';

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="inline-block">
            <Logo />
          </Link>
          <h1 className="mt-10 text-2xl font-bold tracking-[-0.02em] text-ink-950">
            {mode === 'register' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            {mode === 'register'
              ? 'Start generating and deploying websites in minutes.'
              : 'Sign in to your workspace to keep building.'}
          </p>

          <AuthForm mode={mode} prompt={params.prompt} githubEnabled={AUTH_PROVIDERS.github} error={params.error} />
        </div>
      </div>

      <div className="relative hidden overflow-hidden border-l border-ink-200/70 bg-ink-50/60 lg:block">
        <div className="studio-grid absolute inset-0 opacity-70" aria-hidden />
        <div className="relative flex h-full flex-col justify-center px-14">
          <blockquote className="max-w-md text-2xl font-semibold leading-snug tracking-[-0.02em] text-ink-900">
            &ldquo;Prompt, edit, deploy. Every site is stored as structured sections, so nothing you build is trapped in
            a blob of generated HTML.&rdquo;
          </blockquote>
          <div className="mt-8 grid max-w-md gap-3 text-[13px] text-ink-600">
            {[
              'Multi-page generation with a real brand kit',
              'Section-level AI editing with undo/redo',
              'One-click deployment to Vercel',
            ].map((line) => (
              <div key={line} className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
