import { Braces, FileStack, Gauge, Layers, MousePointerClick, Palette, ShieldCheck, Sparkles } from 'lucide-react';
import { Container, Section, SectionHeading } from './shell';

/**
 * Features, with hierarchy rather than a uniform grid.
 *
 * The three that actually differentiate the product get wide blocks with a
 * supporting detail line; the rest are a compact list underneath. A flat grid
 * of eight equal cards says everything is equally important, which is the same
 * as saying nothing is.
 */

const PRIMARY = [
  {
    icon: Layers,
    title: 'Structured websites',
    body: 'Your website is stored as pages and typed sections, not a blob of generated HTML.',
    detail: 'Every heading, image, link and colour is a field. Change it by hand at any point without fighting the AI.',
  },
  {
    icon: Sparkles,
    title: 'AI Copilot',
    body: 'Give a natural-language instruction and it modifies exactly the section you selected.',
    detail: 'It calls validated operations on the document. It does not rewrite the project around your change.',
  },
  {
    icon: Gauge,
    title: 'Fast static output',
    body: 'Deployed sites are plain HTML with one precompiled stylesheet.',
    detail: 'No framework runtime, no hydration, and no JavaScript required for the generated site to render.',
  },
];

const SECONDARY = [
  { icon: MousePointerClick, title: 'Visual editing', body: 'Edit text, images, layouts, sections and styles directly on the page.' },
  { icon: Palette, title: 'Real brand kits', body: 'Typography, colour, spacing, radius and button style, applied consistently.' },
  { icon: FileStack, title: 'Multi-page websites', body: 'Home, About, Services, Contact and any custom page you need.' },
  { icon: ShieldCheck, title: 'AI validation', body: 'Every AI operation is checked against a schema before it is applied.' },
  { icon: Braces, title: 'No lock-in', body: 'Deploy to your own Vercel account and keep portable HTML and CSS.' },
];

export function Features() {
  return (
    <Section id="features">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title="Built to be kept, not just launched"
          body="The things that matter once the novelty wears off and you actually have to maintain the site."
        />

        <div className="mt-16 divide-y divide-ink-200 border-y border-ink-200">
          {PRIMARY.map((feature, i) => (
            <div
              key={feature.title}
              className="reveal grid gap-4 py-9 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-10"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink-950 text-white">
                <feature.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </span>
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-ink-950">{feature.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{feature.body}</p>
              </div>
              <p className="text-[14px] leading-relaxed text-ink-500 lg:pt-8">{feature.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {SECONDARY.map((feature, i) => (
            <div key={feature.title} className="reveal" style={{ transitionDelay: `${i * 45}ms` }}>
              <feature.icon className="h-[18px] w-[18px] text-ink-900" strokeWidth={1.8} />
              <h3 className="mt-3.5 text-[15px] font-medium text-ink-950">{feature.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">{feature.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
