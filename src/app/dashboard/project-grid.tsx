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

export function ProjectGrid({ projects }: { projects: ProjectSummary[] }) {
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="group flex flex-col rounded-xl border border-ink-200 bg-white p-5 transition-shadow hover:shadow-panel"
          >
            <div className="flex items-start justify-between gap-3">
              <Link href={`/editor/${project.id}`} className="min-w-0">
                <h2 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink-900 group-hover:text-brand-700">
                  {project.name}
                </h2>
              </Link>
              <ProjectStatusBadge status={project.status} />
            </div>

            <p className="mt-1.5 line-clamp-2 min-h-[34px] text-[13px] leading-relaxed text-ink-500">
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
                className="mt-3 inline-flex items-center gap-1.5 truncate text-[12px] font-medium text-emerald-700 hover:underline"
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate">{project.productionUrl.replace('https://', '')}</span>
              </a>
            ) : null}

            <div className="mt-5 flex items-center gap-2 border-t border-ink-100 pt-4">
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
          </article>
        ))}
      </div>
    </div>
  );
}
