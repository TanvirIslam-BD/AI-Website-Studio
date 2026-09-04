'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/field';
import { errorMessage } from '@/lib/utils';

/**
 * Mapping this workspace's websites onto the connected account's Vercel
 * projects.
 *
 * A site with no mapping creates its own Vercel project on first publish, named
 * from its slug - the right default, and what most people want. Mapping matters
 * for the case that default cannot serve: a site meant to replace what is
 * already live at a domain has to publish into the project that domain is
 * attached to, not land beside it under a new name.
 *
 * Shown during the install, where the integration review guidelines ask for it,
 * and again on the Configure screen - so a choice made once is never trapped in
 * a flow you could only reach by reinstalling.
 */

type Site = { id: string; name: string; slug: string };

type VercelProject = { id: string; name: string; framework: string | null; url: string | null };

type Link = { vercelProjectId: string | null; vercelProjectName: string | null; defaultName: string };

const NEW_PROJECT = '__new__';

export function SiteProjectMapper({ compact = false }: { compact?: boolean }) {
  const [sites, setSites] = useState<Site[] | null>(null);
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [links, setLinks] = useState<Record<string, Link>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [siteResponse, projectResponse] = await Promise.all([
        fetch('/api/projects', { cache: 'no-store' }),
        fetch('/api/workspace/vercel/projects', { cache: 'no-store' }),
      ]);

      const sitePayload = (await siteResponse.json()) as { projects?: Site[]; error?: string };
      if (!siteResponse.ok) throw new Error(sitePayload.error ?? 'Could not read your websites.');
      const mine = sitePayload.projects ?? [];
      setSites(mine);

      const projectPayload = (await projectResponse.json()) as {
        projects?: VercelProject[];
        next?: number | null;
        error?: string;
      };
      if (!projectResponse.ok) throw new Error(projectPayload.error ?? 'Could not read your Vercel projects.');
      setProjects(projectPayload.projects ?? []);
      setCursor(projectPayload.next ?? null);

      // Current mappings, one request per site. There are few of them, and this
      // keeps the project listing endpoint free of deployment concerns.
      const entries = await Promise.all(
        mine.map(async (site) => {
          const response = await fetch(`/api/projects/${site.id}/vercel`, { cache: 'no-store' });
          const payload = (await response.json()) as Link;
          return [site.id, payload] as const;
        }),
      );
      setLinks(Object.fromEntries(entries));
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * Vercel pages projects by timestamp, so an account holding more than one
   * page still reaches all of them. Showing only the first twenty would hide
   * exactly the project someone came here to pick.
   */
  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const response = await fetch(`/api/workspace/vercel/projects?until=${cursor}`, { cache: 'no-store' });
      const payload = (await response.json()) as { projects?: VercelProject[]; next?: number | null; error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Could not read more projects.');
      setProjects((current) => [...current, ...(payload.projects ?? [])]);
      setCursor(payload.next ?? null);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoadingMore(false);
    }
  }

  async function choose(siteId: string, value: string) {
    const target = value === NEW_PROJECT ? null : (projects.find((project) => project.id === value) ?? null);
    setSaving(siteId);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${siteId}/vercel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vercelProjectId: target?.id ?? null,
          vercelProjectName: target?.name ?? null,
        }),
      });
      const payload = (await response.json()) as Link & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Could not save that choice.');
      setLinks((current) => ({ ...current, [siteId]: payload }));
      setSaved(siteId);
      window.setTimeout(() => setSaved((current) => (current === siteId ? null : current)), 1800);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center rounded-xl border border-ink-200 py-8 text-ink-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error && !sites) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3">
        <p className="flex items-start gap-2 text-[13px] text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
        </p>
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => void load()}>
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </Button>
      </div>
    );
  }

  if (!sites || sites.length === 0) {
    return (
      <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
        <p className="text-[13px] font-semibold text-ink-900">No websites yet</p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-600">
          Once you describe a business and generate a site, it publishes to this Vercel account. Come back here to
          point it at an existing project instead.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-2.5">
      <ul className="divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-200">
        {sites.map((site) => {
          const link = links[site.id];
          const value = link?.vercelProjectId ?? NEW_PROJECT;
          // A project that was mapped and has since been deleted on Vercel's
          // side would otherwise drop out of the list and silently read as
          // "create new", which nobody chose. Keep it visible and labelled.
          const missing =
            link?.vercelProjectId && !projects.some((project) => project.id === link.vercelProjectId) ? link : null;

          return (
            <li
              key={site.id}
              className={`grid gap-2 px-3 ${compact ? 'py-2.5' : 'py-3'} sm:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] sm:items-center`}
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink-900">{site.name}</p>
                <p className="truncate text-[11px] text-ink-500">
                  {link?.vercelProjectName
                    ? `Publishes into ${link.vercelProjectName}`
                    : `Creates ${link?.defaultName ?? site.slug}`}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Select
                  value={value}
                  disabled={saving === site.id}
                  onChange={(event) => void choose(site.id, event.target.value)}
                  className="text-[12px]"
                  aria-label={`Vercel project for ${site.name}`}
                >
                  <option value={NEW_PROJECT}>Create a new project</option>
                  {missing ? (
                    <option value={missing.vercelProjectId ?? ''}>{missing.vercelProjectName} (not found)</option>
                  ) : null}
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
                <span className="w-4 shrink-0">
                  {saving === site.id ? <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-400" /> : null}
                  {saved === site.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : null}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {cursor ? (
        <Button variant="ghost" size="sm" loading={loadingMore} onClick={() => void loadMore()}>
          Load more Vercel projects
        </Button>
      ) : null}

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p> : null}

      <p className="text-[11px] leading-relaxed text-ink-400">
        Left on <strong className="font-semibold text-ink-500">Create a new project</strong>, publishing makes a Vercel
        project named after the site. Point it at an existing one to publish into that instead, which is what you want
        when a domain is already attached there.{' '}
        <a
          href="https://vercel.com/docs/projects/overview"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 underline decoration-ink-300 underline-offset-2 hover:text-ink-700"
        >
          About Vercel projects <ExternalLink className="h-3 w-3" />
        </a>
      </p>
    </div>
  );
}
