import { ArrowRight } from 'lucide-react';
import { OPERATION_NAMES } from '@/lib/website/operations';
import { Container, Section, SectionHeading, CodeFrame } from './shell';

/**
 * The copilot's differentiator: it calls validated operations instead of
 * rewriting the project. The operation list is imported from the operations
 * layer, so this section cannot advertise a capability that does not exist.
 */

const EXAMPLES = [
  'Make this section more premium',
  'Rewrite the copy so it is sharper',
  'Change the layout',
  'Make this conversion focused',
  'Use a darker design',
  'Add pricing after the gallery',
];

const SAMPLE = `{
  "message": "Rewrote the hero and warmed up the palette.",
  "operations": [
    {
      "name": "update_section",
      "input": {
        "sectionId": "sec_9f2a",
        "props": {
          "heading": "Photographs that feel like you",
          "variant": "centered"
        }
      }
    },
    {
      "name": "update_theme",
      "input": { "primaryColor": "#b45309", "radius": "lg" }
    }
  ]
}`;

export function CopilotShowcase() {
  return (
    <Section tone="dark">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              dark
              align="left"
              eyebrow="AI copilot"
              title="It edits your site. It does not rewrite it."
              body="Ask in plain language and the copilot calls specific, validated operations on the section you have selected. Small, reviewable, reversible changes - never a fresh site you did not ask for."
            />

            <ul className="mt-8 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <li
                  key={example}
                  className="rounded-full border border-ink-700 bg-ink-900/60 px-3 py-1.5 text-[13px] text-ink-300"
                >
                  {example}
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-xl border border-ink-800 bg-ink-900/50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                {OPERATION_NAMES.length} operations it can call
              </p>
              <p className="mt-2 font-mono text-[11px] leading-relaxed text-ink-300">
                {OPERATION_NAMES.join('  ·  ')}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2.5 text-[13px] text-ink-400">
              <span className="rounded-lg bg-white px-3 py-1.5 font-medium text-ink-900">
                &ldquo;Make the hero more premium&rdquo;
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              <span>becomes</span>
            </div>
            <CodeFrame title="copilot response">
              <pre className="font-mono text-[11.5px] leading-relaxed text-ink-300">
                <code>{SAMPLE}</code>
              </pre>
            </CodeFrame>
            <p className="mt-3 text-[12px] leading-relaxed text-ink-400">
              The server validates every call against the same schema your own clicks go through. If the model gets an
              argument wrong it is told exactly why and corrected - once - rather than guessing.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
