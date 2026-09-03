/**
 * Development seed.
 *
 * Creates one demo account with a couple of generated websites so the
 * dashboard and editor have something in them on a fresh database. Uses the
 * offline template generator, so it never needs an API key and always produces
 * the same result.
 *
 *   npm run db:seed
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateFromTemplate } from '../src/lib/ai/template';
import { createProjectWithDocument } from '../src/lib/website/persistence';
import { slugify } from '../src/lib/ids';

const db = new PrismaClient();

const DEMO_EMAIL = 'demo@aiwebsitestudio.test';
const DEMO_PASSWORD = 'demo1234';

const BRIEFS = [
  'A modern website for a photography business called Aperture Studio',
  'A neighbourhood Italian restaurant with a short seasonal menu',
  'A landing page for a project management SaaS aimed at agencies',
];

async function main() {
  const user = await db.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      name: 'Demo User',
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 12),
    },
  });

  const workspace = await db.workspace.upsert({
    where: { slug: 'demo-studio' },
    update: {},
    create: {
      name: 'Demo Studio',
      slug: 'demo-studio',
      plan: 'PRO',
      members: { create: { userId: user.id, role: 'OWNER' } },
    },
  });

  for (const brief of BRIEFS) {
    const site = generateFromTemplate(brief);
    const slug = slugify(site.brand, 'site');

    const existing = await db.project.findFirst({ where: { workspaceId: workspace.id, slug } });
    if (existing) {
      console.log(`  = ${site.brand} (already seeded)`);
      continue;
    }

    const project = await createProjectWithDocument({
      workspaceId: workspace.id,
      userId: user.id,
      name: site.brand,
      description: site.description,
      prompt: brief,
      document: site.document,
    });

    await db.chatMessage.createMany({
      data: [
        { projectId: project.id, role: 'USER', content: brief },
        {
          projectId: project.id,
          role: 'ASSISTANT',
          content: `I built a ${site.document.pages.length}-page website for ${site.brand}. Select any section to edit it, or tell me what to change.`,
        },
      ],
    });

    console.log(`  + ${site.brand} (${site.document.pages.length} pages)`);
  }

  console.log(`\nSeeded workspace "${workspace.name}".`);
  console.log(`Sign in with ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
