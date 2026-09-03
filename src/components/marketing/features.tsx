import { Braces, FileStack, Gauge, ImageIcon, Layers, Palette, ShieldCheck, Undo2, Users } from 'lucide-react';
import { Container, Section, SectionHeading } from './shell';

const FEATURES = [
  {
    icon: Layers,
    title: 'Structured, not scraped',
    body: 'Your site is stored as pages, typed sections and a brand kit - never a blob of generated HTML. Everything stays editable by hand.',
  },
  {
    icon: Palette,
    title: 'A real brand kit',
    body: 'Colours, fonts, corner radius, button style, density and light/dark - applied consistently across every section in one move.',
  },
  {
    icon: FileStack,
    title: 'Multi-page from the start',
    body: 'Home, About, Services, Contact and any custom page you want, each with its own sections, SEO title and description.',
  },
  {
    icon: Undo2,
    title: 'Undo everything',
    body: 'Manual edits and AI changes share one history stack, so a copilot instruction is exactly as reversible as a keystroke.',
  },
  {
    icon: Gauge,
    title: 'Fast, static output',
    body: 'Deployed sites are plain HTML with one precompiled stylesheet. No framework runtime, no hydration, no client-side JavaScript.',
  },
  {
    icon: ImageIcon,
    title: 'Imagery included',
    body: 'On-topic photography is chosen during generation, and a searchable library is one click away from any image slot.',
  },
  {
    icon: ShieldCheck,
    title: 'AI output is validated',
    body: 'Every change is parsed against a schema. Unknown fields are dropped, unsafe links are stripped, and no generated code is ever executed.',
  },
  {
    icon: Users,
    title: 'Built for many clients',
    body: 'Workspaces scope every project, so agencies and freelancers can keep client sites cleanly separated from day one.',
  },
  {
    icon: Braces,
    title: 'No lock-in',
    body: 'It deploys to your own Vercel account and the output is portable HTML and CSS. Take it and host it anywhere.',
  },
];

export function Features() {
  return (
    <Section id="features">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to ship a site people trust"
          body="Built like a product you would keep using after the novelty wears off."
        />

        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title}>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <feature.icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-ink-900">{feature.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{feature.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
