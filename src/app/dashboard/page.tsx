import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ExternalLink, LayoutGrid, Rocket, Sparkles } from 'lucide-react';
import { db } from '@/lib/db';
import { requireWorkspace, currentUser } from '@/lib/tenancy';
import { aiStatus } from '@/lib/ai';
import { isVercelConfigured } from '@/lib/deploy/vercel';
import { documentFromDb, homePage } from '@/lib/website/document';
import { googleFontsHrefFor } from '@/lib/website/theme';
import { PageView, ThemeScope } from '@/components/website/renderer';
import { Logo } from '@/components/brand/logo';
import { PlanBanner } from '@/components/billing/plan-banner';
import { cn } from '@/lib/utils';
import { NewProjectPanel } from './new-project';
import { ProjectGrid } from './project-grid';
import { SiteThumb } from './site-thumb';
import { UserMenu } from './user-menu';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

/**
 * How many sections of each home page the thumbnails load. A card only ever
 * shows the top of the page before hover, and scrolling through six sections
 * is plenty to read as "the whole site" - loading every section of every page
 * of every project would make the dashboard's cost grow with the workspace.
 */
const THUMB_SECTIONS = 6;

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
      // Just enough of each site to draw its card: the theme and the top of
      // the home page.
      theme: true,
      pages: {
        where: { isHome: true },
        take: 1,
        include: { sections: { orderBy: { position: 'asc' }, take: THUMB_SECTIONS } },
      },
    },
  });

  const ai = aiStatus();
  const vercel = isVercelConfigured();

  // Thumbnails render in each site's own typefaces.
  const documents = projects.map((project) => ({ id: project.id, document: documentFromDb(project) }));
  const fontsHref = googleFontsHrefFor(documents.flatMap(({ document }) => [document.theme.headingFont, document.theme.bodyFont]));

  const thumbs = Object.fromEntries(
    documents.map(({ id, document }) => {
      const page = document.pages.length > 0 ? homePage(document) : null;
      const empty = !page || page.sections.length === 0;
      return [
        id,
        empty ? null : (
          <SiteThumb key={id}>
            <ThemeScope theme={document.theme}>
              <PageView page={page} theme={document.theme} hrefFor={() => '#'} decorative />
            </ThemeScope>
          </SiteThumb>
        ),
      ];
    }),
  );

  const firstName = (user.name ?? '').trim().split(/\s+/)[0] || null;
  const live = projects.filter((project) => project.productionUrl).length;

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      {fontsHref ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={fontsHref} />
        </>
      ) : null}

      {/* ------------------------------------------------ dark composer band */}
      <section className="home-page relative isolate overflow-hidden bg-[#07070a] text-white">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="aurora absolute left-1/2 top-[-22rem] h-[40rem] w-[64rem] -translate-x-1/2 opacity-80" />
          <div
            className="home-grid absolute inset-0"
            style={{
              maskImage: 'radial-gradient(60% 70% at 50% 0%, black, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(60% 70% at 50% 0%, black, transparent 80%)',
            }}
          />
        </div>

        <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" className="focus-ring rounded-lg" aria-label="Web Copilot home">
              <Logo tone="light" />
            </Link>
            <span className="hidden min-w-0 items-center gap-2 text-sm text-white/45 sm:flex">
              <span className="text-white/20">/</span>
              <span className="truncate">{workspace.name}</span>
              <span className="rounded-md border border-white/15 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white/80">
                {workspace.plan}
              </span>
            </span>
          </div>
          <UserMenu name={user.name ?? user.email} email={user.email} />
        </header>

        <div className="mx-auto max-w-6xl px-5 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[13px] text-white/45">{firstName ? `Welcome back, ${firstName}` : 'Welcome back'}</p>
              <h1 className="text-gradient mt-2 text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[2.75rem]">
                What are we building today?
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill on={ai.configured} icon={<Sparkles className="h-3 w-3" />}>
                {ai.configured ? ai.label : 'Templates'}
              </StatusPill>
              <StatusPill on={vercel} icon={<Rocket className="h-3 w-3" />}>
                {vercel ? 'Vercel ready' : 'Vercel off'}
              </StatusPill>
            </div>
          </div>

          <div className="mt-8">
            <NewProjectPanel initialPrompt={params.prompt} />
          </div>

          {/* States the limits before they are hit, not only when refused. */}
          <div className="mt-4">
            <PlanBanner />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- the websites */}
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink-950">Your websites</h2>
            <p className="mt-1 text-[13px] text-ink-500">
              {projects.length === 0
                ? 'Describe a business above and the first version is built for you.'
                : `${projects.length} project${projects.length === 1 ? '' : 's'}${live > 0 ? ` · ${live} live` : ''}`}
            </p>
          </div>
        </div>

        <div className="mt-6">
          {projects.length === 0 ? (
            <div className="grid place-items-center rounded-3xl border border-dashed border-ink-300 bg-white px-6 py-16 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-950 text-white">
                <LayoutGrid className="h-5 w-5" />
              </span>
              <p className="mt-5 text-[15px] font-semibold text-ink-900">No websites yet</p>
              <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-500">
                Start with a one-line brief above, or create a blank project and add sections yourself.
              </p>
            </div>
          ) : (
            <ProjectGrid
              projects={projects.map((p) => ({
                id: p.id,
                name: p.name,
                description: p.description,
                status: p.status,
                productionUrl: p.productionUrl,
                updatedAt: p.updatedAt.toISOString(),
                _count: p._count,
              }))}
              thumbs={thumbs}
            />
          )}
        </div>

        {!vercel ? (
          <div className="mt-10 flex flex-wrap items-start gap-4 rounded-2xl border border-ink-200 bg-white p-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-950 text-white">
              <Rocket className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-ink-900">Enable deployment</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
                Add a Vercel access token to <code className="rounded bg-ink-100 px-1.5 py-0.5">.env</code> as{' '}
                <code className="rounded bg-ink-100 px-1.5 py-0.5">VERCEL_TOKEN</code> and restart the dev server. You
                can still generate, edit and preview websites without it.
              </p>
              <a
                href="https://vercel.com/account/tokens"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-900 hover:underline"
              >
                Create a token <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function StatusPill({ on, icon, children }: { on: boolean; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
        on ? 'border-white/15 bg-white/[0.06] text-white/85' : 'border-white/10 text-white/45',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', on ? 'bg-emerald-400' : 'bg-white/30')} aria-hidden />
      {icon}
      {children}
    </span>
  );
}
