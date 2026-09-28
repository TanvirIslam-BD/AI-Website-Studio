import { Check, Code2, Cpu, ShieldCheck } from 'lucide-react';
import { VercelMark } from '@/components/brand/vercel-mark';
import { Band, Container, Heading } from './primitives';

/**
 * Ownership. The part of the pitch other builders cannot make: where the site
 * ends up, what it is made of, and what happens to the content.
 */
const POINTS = [
  {
    icon: VercelMark,
    title: 'Your Vercel account',
    body: 'Deployments go to a project you own, so the site, the domain and the analytics stay with you.',
  },
  {
    icon: Code2,
    title: 'Plain, portable output',
    body: 'HTML and one stylesheet, with no framework runtime - portable to any static host.',
  },
  {
    icon: Cpu,
    title: 'Your choice of model',
    body: 'Runs on CometAPI, Anthropic or OpenAI. With no key configured it falls back to built-in templates.',
  },
  {
    icon: ShieldCheck,
    title: 'Not used for training',
    body: 'Prompts and content go to the provider you configure only to fulfil the request.',
  },
];

const LOG = ['Pages generated', 'Assets optimised', 'HTML generated', 'Sitemap generated', 'robots.txt generated'];

export function Ownership() {
  return (
    <Band id="ownership">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <Heading
              align="left"
              kicker="No lock-in"
              title="You own the website. All of it."
              lede="Nothing is parked on our infrastructure. What you build publishes into your account, in a format any host can serve."
            />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {POINTS.map((point, i) => (
                <li key={point.title} className="reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80">
                    <point.icon className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-medium text-white">{point.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">{point.body}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* A deploy, as the studio reports it. */}
          <div className="reveal relative">
            <div className="aurora-soft absolute -inset-10 -z-10 opacity-70 blur-3xl" aria-hidden />
            <div className="glass relative overflow-hidden rounded-3xl">
              <div className="flex items-center gap-2 border-b border-white/[0.07] px-5 py-3">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                </span>
                <span className="ml-2 font-mono text-[11px] text-white/35">deployment</span>
              </div>
              <div className="p-6 font-mono text-[13px]">
                <p className="text-white">Build complete</p>
                <ul className="mt-4 space-y-2.5">
                  {LOG.map((line) => (
                    <li key={line} className="flex items-center gap-2.5 text-white/60">
                      <Check className="h-3.5 w-3.5 text-emerald-300/90" aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-white/35">Deploying to Vercel...</p>
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="rounded-md bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                    LIVE
                  </span>
                  <span className="truncate text-white/80">https://your-site.vercel.app</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Band>
  );
}
