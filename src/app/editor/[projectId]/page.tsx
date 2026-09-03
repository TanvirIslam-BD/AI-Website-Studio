import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { currentUser, requireProject } from '@/lib/tenancy';
import { documentFromDb } from '@/lib/website/document';
import { EditorShell } from '@/components/editor/shell';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ projectId: string }> };

export async function generateMetadata({ params }: Params) {
  const { projectId } = await params;
  const user = await currentUser();
  if (!user) return { title: 'Editor' };
  try {
    const project = await requireProject(projectId, user.id);
    return { title: `${project.name} · Editor` };
  } catch {
    return { title: 'Editor' };
  }
}

export default async function EditorPage({ params }: Params) {
  const { projectId } = await params;
  const user = await currentUser();
  if (!user) redirect(`/signin?next=/editor/${projectId}`);

  const project = await requireProject(projectId, user.id);

  const messages = await db.chatMessage.findMany({
    where: { projectId, role: { in: ['USER', 'ASSISTANT'] } },
    orderBy: { createdAt: 'asc' },
    take: 40,
    select: { id: true, role: true, content: true },
  });

  return (
    <EditorShell
      bootstrap={{
        projectId: project.id,
        projectName: project.name,
        productionUrl: project.productionUrl,
        document: documentFromDb(project),
        messages: messages.map((message) => ({
          id: message.id,
          role: message.role === 'USER' ? 'USER' : 'ASSISTANT',
          content: message.content,
        })),
      }}
    />
  );
}
