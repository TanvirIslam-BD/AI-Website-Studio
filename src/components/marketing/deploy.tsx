import { CheckCircle2, FileCode2, Globe, Rocket } from 'lucide-react';
import { Container, Section, SectionHeading, CodeFrame } from './shell';

const FILES = [
  { name: 'index.html', note: 'home' },
  { name: 'about.html', note: 'about' },
  { name: 'services.html', note: 'services' },
  { name: 'contact.html', note: 'contact' },
  { name: '_site.css', note: 'one precompiled stylesheet' },
  { name: 'sitemap.xml', note: 'generated' },
  { name: 'robots.txt', note: 'generated' },
];

const STAGES = ['Queued', 'Building', 'Live'];

export function Deploy() {
  return (
    <Section tone="muted">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Deployment"
              title="One click, and it is on the internet"
              body="Your site is built into static files and pushed to your own Vercel account. You watch the build, then get the production URL. Redeploy whenever you change something."
            />

            <div className="mt-8 flex items-center gap-2">
              {STAGES.map((stage, i) => (
                <span key={stage} className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                      i === 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-ink-600 ring-1 ring-ink-200'
                    }`}
                  >
                    {i === 2 ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                    {stage}
                  </span>
                  {i < STAGES.length - 1 ? <span className="h-px w-5 bg-ink-300" /> : null}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-3">
              <p className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-600">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                Deploys to <strong className="font-semibold text-ink-900">your</strong> Vercel account with your own
                token, so the site and its domain stay yours.
              </p>
              <p className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-600">
                <FileCode2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                No server code is generated and nothing the AI produced is ever executed - the output is HTML and CSS.
              </p>
              <p className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-600">
                <Rocket className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                A four-page site is around 110 kB total and needs no JavaScript to render.
              </p>
            </div>
          </div>

          <CodeFrame title="files to ship">
            <div className="grid gap-1.5">
              {FILES.map((file) => (
                <div key={file.name} className="flex items-baseline justify-between gap-6 font-mono text-[12px]">
                  <span className="text-ink-200">{file.name}</span>
                  <span className="text-ink-500">{file.note}</span>
                </div>
              ))}
              <div className="mt-3 border-t border-ink-800 pt-3 font-mono text-[12px] text-ink-400">
                7 files · 112.8 kB · 0 kB JavaScript
              </div>
            </div>
          </CodeFrame>
        </div>
      </Container>
    </Section>
  );
}
