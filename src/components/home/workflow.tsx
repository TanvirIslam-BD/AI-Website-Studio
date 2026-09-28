import { Band, Container, Heading } from './primitives';

/**
 * How it works, in three moves, each shown with a capture of the real screen
 * where it happens.
 */
const STEPS = [
  {
    n: '01',
    title: 'Describe',
    body: 'Tell it what the business does. One line is enough; a fuller brief - services, tone, audience - gets you closer on the first pass.',
    src: '/product/01-dashboard.webp',
    alt: 'The dashboard prompt box with example briefs.',
  },
  {
    n: '02',
    title: 'Refine',
    body: 'Click any section to change its fields, or ask the copilot for the change in plain words. Every edit is a real, undoable operation.',
    src: '/product/03-section-selected.webp',
    alt: 'A selected section with its editable fields in the inspector.',
  },
  {
    n: '03',
    title: 'Publish',
    body: 'One click builds static HTML and deploys it to a Vercel project you own. Change something later and redeploy the same way.',
    src: '/product/05-deploy.webp',
    alt: 'The deploy dialog, listing the files that will be published.',
  },
];

export function Workflow() {
  return (
    <Band id="how-it-works">
      <Container>
        <Heading
          kicker="How it works"
          title="From a sentence to a live URL in three moves."
          lede="No template gallery, no blank canvas, no drag-and-drop. You start with a finished draft and make it right."
        />

        <ol className="mt-16 grid gap-5 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.n}
              className="reveal glass group relative flex flex-col overflow-hidden rounded-3xl"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="p-7 pb-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[12px] text-sky-200/70">{step.n}</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" aria-hidden />
                </div>
                <h3 className="mt-5 text-[1.5rem] font-semibold tracking-[-0.03em] text-white">{step.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-white/50">{step.body}</p>
              </div>
              <div className="mt-auto px-3 pb-3">
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={step.src}
                    alt={step.alt}
                    width={1600}
                    height={900}
                    loading="lazy"
                    decoding="async"
                    className="block aspect-[16/10] w-full object-cover object-left-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Band>
  );
}
