'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ExternalLink, Eye, FileText, Pencil, Rocket, Trash2 } from 'lucide-react';
import type { ProjectStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { ProjectStatusBadge } from '@/components/ui/misc';
import { errorMessage, formatRelative } from '@/lib/utils';

export type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  productionUrl: string | null;
  updatedAt: string;
  _count: { pages: number; deployments: number };
};

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
      {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p> : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
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
