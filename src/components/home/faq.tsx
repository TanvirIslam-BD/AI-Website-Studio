import { Plus } from 'lucide-react';
import { COMPANY } from '@/lib/brand';
import { FaqStructuredData } from '@/components/seo/structured-data';
import { Band, Container, Heading } from './primitives';

/**
 * Answers are deliberately specific about current limits. A visitor who finds
 * out later feels misled; one who reads it here can decide.
 *
 * Uses native details/summary, so it works without JavaScript.
 */
export const FAQS = [
  /**
   * The first four define the category before answering about the product.
   *
   * Someone searching "what is an AI website generator" has not decided they
   * want this one yet, and a page that answers only "how do I use ours" is no
   * use to them. These also give an answer engine a definition it can quote
   * without having to assemble one out of marketing copy.
   */
  {
    q: 'What is an AI website generator?',
    a: 'An AI website generator turns a written description of a business into a working website - pages, sections, copy and imagery - instead of asking you to assemble one from blocks or a template. Web Copilot AI Studio is an AI website generator: you describe the site in a sentence and it produces a complete, editable, multi-page website you can then publish.',
  },
  {
    q: 'Can I create a website from a prompt?',
    a: 'Yes. A prompt as short as "a neighbourhood sushi restaurant with a seasonal omakase menu" is enough. A longer brief - your services, tone, audience, the pages you want - produces a closer first draft, and you can keep refining after generation rather than starting again.',
  },
  {
    q: 'Can Web Copilot generate a multi-page website?',
    a: 'Yes. Generation produces a multi-page site - typically home, about, services and contact - with a shared header, footer and brand kit, not a single landing page. You can add, remove and reorder pages and sections afterwards.',
  },
  {
    q: 'Can I edit an AI-generated website with AI?',
    a: 'Yes, in two ways. The visual editor exposes every heading, image, link, colour and spacing value as a field, and the AI copilot takes instructions in plain language - "make the hero darker", "add a pricing section", "rewrite this for a younger audience" - and applies them as real edits you can undo.',
  },
  {
    q: 'Do I need to know how to code?',
    a: 'No. You describe the business, then edit what you see. Everything the AI produces is editable through the visual editor, and nothing requires touching markup.',
  },
  {
    q: 'Where does my website live?',
    a: 'On your own Vercel account. You add a Vercel token, and deployments go to a project you own - so the site, the domain and the analytics stay with you.',
  },
  {
    q: 'Can I edit the site manually?',
    a: 'Yes, and that is the point. Sites are stored as structured sections rather than generated markup, so every heading, image, link and colour is a field you can change without fighting the AI.',
  },
  {
    q: 'Can I use my own domain?',
    a: 'You can point a domain at the deployment from your Vercel dashboard today. Managing domains from inside the studio is planned.',
  },
  {
    q: 'Which AI models does it use?',
    a: 'Whichever you configure. It runs on CometAPI, Anthropic or OpenAI, and switching provider is a single environment variable. With no key configured it falls back to built-in templates, so the product still works.',
  },
  {
    q: 'Is my data used to train models?',
    a: 'No. Your prompts and site content go to the AI provider you configure purely to fulfil the request, and nothing is used for training by this product.',
  },
  {
    q: 'What happens to forms?',
    a: 'On a deployed site the contact form opens the visitor’s email client with the message pre-filled, which needs no backend. A hosted form endpoint is on the roadmap.',
  },
  {
    q: 'Can I export my website?',
    a: 'What deploys is plain HTML and one stylesheet, with no framework runtime, so the output is portable to any static host. A direct download from the studio is not built yet.',
  },
];

/**
 * FAQ. The answers are shared with the structured data, so the markup cannot
 * describe answers a reader cannot see. Native details/summary: keyboard
 * accessible and works with no JavaScript.
 */
export function Faq() {
  return (
    <Band id="faq">
      <FaqStructuredData items={FAQS} path="/" />
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Heading
              align="left"
              kicker="FAQ"
              title="Straight answers."
              lede="Including the limits. If something is not built yet, it says so here."
            />
            <p className="reveal mt-8 text-[14px] text-white/45">
              Something else?{' '}
              <a
                href={`mailto:${COMPANY.supportEmail}`}
                className="focus-ring rounded text-white underline decoration-white/25 underline-offset-4 hover:decoration-white"
              >
                {COMPANY.supportEmail}
              </a>
            </p>
          </div>

          <div className="reveal divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {FAQS.map((item) => (
              <details key={item.q} className="group">
                <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-6 rounded py-5 text-left text-[15px] font-medium text-white/90 transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 text-white/50 transition-transform duration-300 group-open:rotate-45">
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr]">
                  <p className="overflow-hidden pr-10 text-[14px] leading-relaxed text-white/55">
                    <span className="block pb-6">{item.a}</span>
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </Band>
  );
}
