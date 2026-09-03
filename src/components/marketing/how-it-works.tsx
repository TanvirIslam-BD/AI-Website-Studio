import { MousePointerClick, Rocket, Sparkles, Wand2 } from 'lucide-react';
import { Container, Section, SectionHeading } from './shell';
import { EditorPreview } from './editor-preview';

const STEPS = [
  {
    icon: Wand2,
    title: 'Describe the business',
    body: 'One line is enough. The AI plans the pages, writes the copy, picks on-topic imagery and chooses a brand kit that suits the industry.',
  },
  {
    icon: MousePointerClick,
    title: 'Edit what you see',
    body: 'Click any section to change text, swap images, reorder, duplicate or restyle it. Desktop, tablet and mobile previews are real, not approximations.',
  },
  {
    icon: Sparkles,
    title: 'Direct the copilot',
    body: 'Ask for "a darker, more premium look" or "a stronger call to action". It edits the section you have selected rather than regenerating the site.',
  },
  {
    icon: Rocket,
    title: 'Deploy it',
    body: 'One click builds static HTML and ships it to Vercel. You get the build status and the production URL, and can redeploy any time.',
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" tone="muted">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Four steps, and the last one is live"
          body="No template picking, no blank canvas, no drag-and-drop archaeology. Describe it, refine it, ship it."
        />

        <div className="mt-14">
          <EditorPreview />
        </div>

        <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-900 text-white">
                  <step.icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>
                <span className="font-mono text-xs text-ink-400">0{index + 1}</span>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
