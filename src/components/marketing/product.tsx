import { Layers, MonitorSmartphone, MousePointerClick, Palette, Rocket, Sparkles } from 'lucide-react';
import { Container, Section, SectionHeading } from './shell';
import { SiteShowcase } from './site-showcase';

/**
 * The product, at full size.
 *
 * The frame below is not a mockup: it renders a real generated document
 * through the same section components that build the deployed site. The
 * callouts name what a visitor is looking at, so the capability list is
 * anchored to something concrete rather than floating as marketing claims.
 */
const CALLOUTS = [
  { icon: Layers, label: 'AI-generated pages', detail: 'Home, About, Services, Contact' },
  { icon: MousePointerClick, label: 'Visual editor', detail: 'Click any section to change it' },
  { icon: Sparkles, label: 'AI Copilot', detail: 'Edit by describing the change' },
  { icon: Palette, label: 'Brand kit', detail: 'Type, colour, radius, spacing' },
  { icon: MonitorSmartphone, label: 'Responsive preview', detail: 'Real breakpoints, not guesses' },
  { icon: Rocket, label: 'One-click deployment', detail: 'Static output to your Vercel' },
];

export function ProductShowcase() {
  return (
    <Section id="product" className="pt-4 sm:pt-6">
      <Container>
        <SectionHeading
          eyebrow="The product"
          title="One sentence in. *A complete website out.*"
          body="Generated as structured pages and sections, so every heading, image, link and colour stays yours to change."
        />

        <div className="reveal mt-14">
          <SiteShowcase />
        </div>

        <ul className="mt-12 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {CALLOUTS.map((callout, i) => (
            <li key={callout.label} className="reveal flex gap-3.5" style={{ transitionDelay: `${i * 45}ms` }}>
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-ink-200 bg-white text-ink-900">
                <callout.icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span>
                <span className="block text-[14px] font-medium text-ink-900">{callout.label}</span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-500">{callout.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
