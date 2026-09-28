import { Check, Gauge } from 'lucide-react';
import { Container, Section, SectionHeading } from './shell';

/**
 * Deployment and performance.
 *
 * Deployment is shown as a console rather than described, because the claim
 * that matters - static HTML to your own account - is only convincing when you
 * can see what actually ships. The figures below it are measured from the
 * generated output, not aspirational.
 */

const STAGES = ['Editing', 'Building', 'Deploying', 'Live'];

const BUILD_LOG = [
  'Pages generated',
  'Assets optimised',
  'HTML generated',
  'Sitemap generated',
  'robots.txt generated',
];

const METRICS = [
  { value: '0 KB', label: 'JavaScript shipped', detail: 'Nothing to hydrate' },
  { value: '~110 KB', label: 'Four-page site', detail: 'Including one stylesheet' },
  { value: '13 KB', label: 'Precompiled CSS', detail: 'One file, every site' },
  { value: 'Static', label: 'Plain HTML output', detail: 'No framework runtime' },
];

export function Deploy() {
  return (
    <Section id="deploy" tone="muted">
      <Container>
        <SectionHeading
          eyebrow="Deployment"
          title="From editor to *live website.*"
          body="Your Vercel account. Your website. Your domain."
        />

        <div className="reveal mt-12 flex flex-wrap items-center justify-center gap-2">
          {STAGES.map((stage, i) => (
            <span key={stage} className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium ${
                  i === STAGES.length - 1
                    ? 'bg-ink-950 text-white'
                    : 'border border-ink-200 bg-white text-ink-600'
                }`}
              >
                {i === STAGES.length - 1 ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                {stage}
              </span>
              {i < STAGES.length - 1 ? <span className="h-px w-5 bg-ink-300" aria-hidden /> : null}
            </span>
          ))}
        </div>

        <div className="reveal mx-auto mt-12 max-w-2xl overflow-hidden rounded-xl border border-ink-900 bg-ink-950 shadow-pop">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
            <span className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/20" />
              ))}
            </span>
            <span className="ml-1 font-mono text-[10px] text-ink-500">deployment</span>
          </div>

          <div className="p-5 font-mono text-[12px]">
            <p className="text-white">Build complete</p>
            <div className="mt-3 space-y-1.5">
              {BUILD_LOG.map((line) => (
                <p key={line} className="flex items-center gap-2 text-ink-400">
                  <Check className="h-3 w-3 shrink-0 text-white" strokeWidth={2.5} />
                  {line}
                </p>
              ))}
            </div>
            <p className="mt-4 text-ink-500">Deploying to Vercel...</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
              <span className="rounded bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-950">
                Live
              </span>
              <span className="text-white">https://your-site.vercel.app</span>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-center justify-center gap-2">
            <Gauge className="h-4 w-4 text-ink-500" strokeWidth={1.8} />
            <h3 className="text-center font-display text-[1.9rem] font-normal tracking-[-0.01em] text-ink-950">Fast by default</h3>
          </div>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-ink-500">
            Generated sites are plain HTML and CSS. There is no framework runtime to download, nothing to hydrate, and
            no client-side JavaScript needed to render the page.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
            {METRICS.map((metric, i) => (
              <div key={metric.label} className="reveal text-center" style={{ transitionDelay: `${i * 50}ms` }}>
                <dd className="font-display text-4xl font-normal tracking-[-0.01em] text-ink-950 sm:text-5xl">{metric.value}</dd>
                <dt className="mt-1.5 text-[12px] font-medium text-ink-700">{metric.label}</dt>
                <p className="mt-0.5 text-[11px] text-ink-400">{metric.detail}</p>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </Section>
  );
}
