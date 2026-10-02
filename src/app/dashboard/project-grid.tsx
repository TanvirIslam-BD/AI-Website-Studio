'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ExternalLink, Eye, FileText, Pencil, Rocket, Search, Trash2, X } from 'lucide-react';
import type { ProjectStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { ProjectStatusBadge } from '@/components/ui/misc';
import { cn, errorMessage, formatRelative } from '@/lib/utils';

export type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  productionUrl: string | null;
  updatedAt: string;
  _count: { pages: number; deployments: number };
};

type Filter = 'all' | 'live' | 'unpublished' | 'error';
type Sort = 'recent' | 'name';

const isLive = (project: ProjectSummary) => Boolean(project.productionUrl) || project.status === 'DEPLOYED';

const FILTERS: Array<{ id: Filter; label: string; test: (project: ProjectSummary) => boolean }> = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'live', label: 'Live', test: isLive },
  { id: 'unpublished', label: 'Not published', test: (project) => !isLive(project) },
  { id: 'error', label: 'Needs attention', test: (project) => project.status === 'ERROR' },
];

export function ProjectGrid({
  projects,
  thumbs,
}: {
  projects: ProjectSummary[];
  /** Server-rendered home-page thumbnails by project id; null for an empty site. */
  thumbs: Record<string, React.ReactNode>;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('recent');

  // Filtering is client-side: the list is already here, and a workspace's
  // projects number in the tens, not thousands.
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const test = FILTERS.find((f) => f.id === filter)?.test ?? (() => true);
    const list = projects.filter(
      (project) =>
        test(project) &&
        (!needle ||
          project.name.toLowerCase().includes(needle) ||
          (project.description ?? '').toLowerCase().includes(needle) ||
          (project.productionUrl ?? '').toLowerCase().includes(needle)),
    );
    return sort === 'name'
      ? list.slice().sort((a, b) => a.name.localeCompare(b.name))
      : list; // Already newest first from the server.
  }, [projects, query, filter, sort]);

  async function remove(project: ProjectSummary) {
    const confirmed = window.confirm(
      `Delete "${project.name}"? This removes its pages, sections and deployment history from the studio. Any site already live on Vercel stays live.`,
    );
    if (!confirmed) return;

    setDeleting(project.id);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Could not delete that project.');
      }
      router.refresh();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      {/* ------------------------------------------------------- toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search websites"
            aria-label="Search websites"
            className="focus-ring h-9 w-full rounded-xl border border-ink-200 bg-white pl-9 pr-8 text-[13px] text-ink-900 placeholder:text-ink-400 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="focus-ring absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-ink-200 bg-white p-1" role="group" aria-label="Filter websites">
          {FILTERS.map((f) => {
            const count = projects.filter(f.test).length;
            if (f.id === 'error' && count === 0) return null;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'focus-ring inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-[12px] font-medium transition-colors',
                  active ? 'bg-ink-950 text-white' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-900',
                )}
              >
                {f.label}
                <span className={cn('tabular-nums', active ? 'text-white/60' : 'text-ink-400')}>{count}</span>
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-[12px] text-ink-500 sm:ml-auto">
          Sort
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
            className="focus-ring h-9 rounded-xl border border-ink-200 bg-white px-2.5 text-[13px] text-ink-900"
          >
            <option value="recent">Recently edited</option>
            <option value="name">Name A-Z</option>
          </select>
        </label>
      </div>

      {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p> : null}

      {visible.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-ink-300 bg-white px-6 py-14 text-center">
          <p className="text-[14px] font-medium text-ink-900">No websites match</p>
          <p className="mt-1 text-[13px] text-ink-500">Try a different search, or show all websites.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setFilter('all');
            }}
            className="focus-ring mt-4 rounded-lg border border-ink-200 px-3 py-1.5 text-[12px] font-medium text-ink-800 hover:bg-ink-50"
          >
            Clear filters
          </button>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => {
          const thumb = thumbs[project.id];
          const host = project.productionUrl?.replace(/^https?:\/\//, '') ?? null;
          return (
            <article
              key={project.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-[0_1px_2px_rgba(10,10,10,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-ink-300 hover:shadow-[0_24px_50px_-24px_rgba(10,10,10,0.35)]"
            >
              {/* The site itself, in a browser frame. Hover scrolls through it. */}
              {/*
                A div, not the link itself: the thumbnail is a rendered site with
                links of its own, and a link inside a link is invalid HTML. The
                link is laid over the frame as a sibling instead.
              */}
              <div className="relative border-b border-ink-200/70 bg-ink-100">
                <div className="flex items-center gap-1.5 bg-ink-50 px-3 py-2">
                  <span className="flex gap-1" aria-hidden>
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
                  </span>
                  <span className="ml-1 truncate font-mono text-[10px] text-ink-400">
                    {host ?? 'draft · not published'}
                  </span>
                </div>
                {thumb ?? (
                  <div className="grid aspect-[16/10] place-items-center bg-[repeating-linear-gradient(135deg,#fafafa,#fafafa_10px,#f4f4f5_10px,#f4f4f5_20px)]">
                    <span className="rounded-full border border-ink-200 bg-white px-3 py-1 text-[11px] text-ink-500">
                      Blank canvas
                    </span>
                  </div>
                )}
                {/* Quick actions float in on hover, over the thumbnail. */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 justify-center gap-2 bg-gradient-to-t from-black/45 to-transparent px-3 pb-3 pt-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-950 shadow">
                    <Pencil className="h-3 w-3" /> Open editor
                  </span>
                </span>
                <Link
                  href={`/editor/${project.id}`}
                  className="focus-ring absolute inset-0 rounded-t-2xl"
                  aria-label={`Edit ${project.name}`}
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/editor/${project.id}`} className="focus-ring min-w-0 rounded">
                    <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink-950">{project.name}</h3>
                  </Link>
                  <ProjectStatusBadge status={project.status} />
                </div>

                <p className="mt-1.5 line-clamp-2 min-h-[36px] text-[13px] leading-relaxed text-ink-500">
                  {project.description ?? 'No description yet.'}
                </p>

                <div className="mt-4 flex items-center gap-3 text-[11px] text-ink-400">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3 w-3" /> {project._count.pages} page{project._count.pages === 1 ? '' : 's'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Rocket className="h-3 w-3" /> {project._count.deployments} deploy
                    {project._count.deployments === 1 ? '' : 's'}
                  </span>
                  <span className="ml-auto">{formatRelative(project.updatedAt)}</span>
                </div>

                {project.productionUrl ? (
                  <a
                    href={project.productionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex w-fit max-w-full items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="truncate">{host}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ) : null}

                <div className="mt-auto pt-5">
                  <div className="flex items-center gap-2 border-t border-ink-100 pt-4">
                    <Button variant="primary" size="sm" onClick={() => router.push(`/editor/${project.id}`)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => window.open(`/preview/${project.id}`, '_blank')}>
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto text-ink-400 hover:text-red-600"
                      title="Delete project"
                      loading={deleting === project.id}
                      onClick={() => void remove(project)}
                    >
                      {deleting === project.id ? null : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
