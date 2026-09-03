import { Plus } from 'lucide-react';
import { Container, Section, SectionHeading } from './shell';

/**
 * Answers are deliberately specific about current limits. A visitor who finds
 * out later feels misled; one who reads it here can decide.
 *
 * Uses native details/summary, so it works without JavaScript.
 */
const FAQS = [
  {
    q: 'Do I need to know how to code?',
    a: 'No. You describe the business, then edit what you see. Everything the AI produces is editable through the visual editor.',
  },
  {
    q: 'Where does my website actually live?',
    a: 'On your own Vercel account. You add a Vercel token, and deployments go to a project you own - so the site, the domain and the analytics stay with you.',
  },
  {
    q: 'Can I edit the site by hand afterwards?',
    a: 'Yes, and that is the point. Sites are stored as structured sections rather than generated markup, so every heading, image, link and colour is a field you can change without fighting the AI.',
  },
  {
    q: 'What happens to the contact form?',
    a: 'On a deployed site it opens the visitor’s email client with the message pre-filled, which needs no backend. A hosted form endpoint is on the roadmap.',
  },
  {
    q: 'Can I use my own domain?',
    a: 'You can point a domain at the deployment from your Vercel dashboard today. Managing domains from inside the studio is planned.',
  },
  {
    q: 'Which AI model does it use?',
    a: 'Whichever you configure. It runs on CometAPI, Anthropic or OpenAI, and swapping provider is a single environment variable. With no key configured it falls back to built-in templates so the product still works.',
  },
  {
    q: 'Will it invent fake reviews or testimonials?',
    a: 'It generates placeholder testimonials so the layout is complete, and they are clearly editable content - replace them with real quotes before you publish.',
  },
  {
    q: 'Is my data used to train models?',
    a: 'No. Your prompts and site content go to the AI provider you configure purely to fulfil the request, and nothing is used for training by this product.',
  },
];

export function Faq() {
  return (
    <Section id="faq" tone="muted">
      <Container>
        <SectionHeading eyebrow="FAQ" title="Questions, answered honestly" />

        <div className="mx-auto mt-12 max-w-3xl">
          {FAQS.map((item) => (
            <details key={item.q} className="group border-b border-ink-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[15px] font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus className="h-4 w-4 shrink-0 text-brand-600 transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="max-w-2xl pb-5 pr-8 text-[14px] leading-relaxed text-ink-600">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
