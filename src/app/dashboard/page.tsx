import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ExternalLink, LayoutGrid, Sparkles } from 'lucide-react';
import { db } from '@/lib/db';
import { requireWorkspace, currentUser } from '@/lib/tenancy';
import { aiStatus } from '@/lib/ai';
import { isVercelConfigured } from '@/lib/deploy/vercel';
import { Badge, EmptyState } from '@/components/ui/misc';
import { Logo } from '@/components/brand/logo';
import { NewProjectPanel } from './new-project';
import { ProjectGrid } from './project-grid';
import { UserMenu } from './user-menu';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ prompt?: string }> }) {
  const user = await currentUser();
  if (!user) redirect('/signin');

  const params = await searchParams;
  const workspace = await requireWorkspace(user.id);

  const projects = await db.project.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      productionUrl: true,
      updatedAt: true,
      _count: { select: { pages: true, deployments: true } },
    },
  });

  const ai = aiStatus();

  return (
    <div className="min-h-screen bg-ink-50/40">
      <header className="border-b border-ink-200/70 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Logo />
            </Link>
            <span className="hidden items-center gap-2 text-sm text-ink-400 sm:flex">
              <span className="text-ink-300">/</span>
              {workspace.name}
              <Badge tone="neutral">{workspace.plan}</Badge>
            </span>
          </div>
          <UserMenu name={user.name ?? user.email} email={user.email} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink-950">Websites</h1>
            <p className="mt-1 text-sm text-ink-500">
              {projects.length === 0
                ? 'Describe a business and the AI will build the first version.'
                : `${projects.length} project${projects.length === 1 ? '' : 's'} in this workspace.`}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <Badge tone={ai.configured ? 'brand' : 'neutral'}>
              <Sparkles className="h-3 w-3" /> {ai.configured ? ai.label : 'templates'}
            </Badge>
            <Badge tone={isVercelConfigured() ? 'success' : 'neutral'}>
              {isVercelConfigured() ? 'Vercel ready' : 'Vercel off'}
            </Badge>
          </div>
        </div>

        <div className="mt-8">
          <NewProjectPanel initialPrompt={params.prompt} />
        </div>

        <div className="mt-10">
          {projects.length === 0 ? (
            <EmptyState
              icon={<LayoutGrid className="h-7 w-7" />}
              title="No websites yet"
              description="Start with a one-line brief above, or create a blank project and add sections yourself."
            />
          ) : (
            <ProjectGrid projects={projects.map((p) => ({ ...p, updatedAt: p.updatedAt.toISOString() }))} />
          )}
        </div>

        {!isVercelConfigured() ? (
          <div className="mt-10 rounded-xl border border-ink-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-ink-900">Enable deployment</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
              Add a Vercel access token to <code className="rounded bg-ink-100 px-1.5 py-0.5">.env</code> as{' '}
              <code className="rounded bg-ink-100 px-1.5 py-0.5">VERCEL_TOKEN</code> and restart the dev server. You can
              still generate, edit and preview websites without it.
            </p>
            <a
              href="https://vercel.com/account/tokens"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-600 hover:underline"
            >
              Create a token <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : null}
      </main>
    </div>
  );
}
