import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { currentUser, requireProject } from '@/lib/tenancy';
import { documentFromDb, findPage } from '@/lib/website/document';
import { WebsiteView, previewHrefResolver } from '@/components/website/renderer';

/**
 * Isolated website preview.
 *
 * Renders a project's page through the same components the static export uses,
 * with no studio chrome, so what the user sees here is what gets deployed.
 * Internal links are rewritten to stay inside the preview.
 */

type Params = { params: Promise<{ projectId: string; slug?: string[] }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { projectId, slug } = await params;
  const user = await currentUser();
  if (!user) return { title: 'Preview' };

  try {
    const project = await requireProject(projectId, user.id);
    const document = documentFromDb(project);
    const page = findPage(document, (slug ?? []).join('/'));
    return {
      title: page?.seoTitle || `${page?.name ?? 'Preview'} · ${project.name}`,
      description: page?.seoDesc ?? project.description ?? undefined,
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: 'Preview' };
  }
}

export default async function PreviewPage({ params }: Params) {
  const { projectId, slug } = await params;
  const user = await currentUser();
  if (!user) redirect(`/signin?next=/preview/${projectId}`);

  const project = await requireProject(projectId, user.id);
  const document = documentFromDb(project);
  const page = findPage(document, (slug ?? []).join('/'));
  if (!page) notFound();

  return (
    <WebsiteView document={document} page={page} hrefFor={previewHrefResolver(projectId)} className="min-h-screen" />
  );
}
