import type { SectionType } from '@/lib/website/sections';
import { MOCK, MockImg } from './mock-content';

/**
 * Miniature previews for each section type.
 *
 * These were abstract grey rectangles, which read as wireframes rather than a
 * product. They now use the same photography the generator picks and real
 * copy, so each card looks like the section it describes. Type is genuinely
 * tiny here - that is what a thumbnail of real UI looks like, and it reads as
 * content in a way a grey bar never does.
 */

const rule = 'rounded-[1px] bg-ink-300';
const card = 'rounded-[2px] bg-white ring-1 ring-inset ring-ink-200';

function Frame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`flex h-[74px] w-full flex-col gap-1.5 overflow-hidden rounded-lg bg-ink-50 p-2.5 ring-1 ring-inset ring-ink-200/70 ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionThumb({ type }: { type: SectionType }) {
  switch (type) {
    case 'header':
      return (
        <Frame className="justify-start">
          <div className="flex items-center gap-1.5">
            <span className="text-[5px] font-bold tracking-tight text-ink-900">{MOCK.brand}</span>
            <span className="ml-auto flex gap-1.5">
              {MOCK.nav.slice(0, 3).map((item) => (
                <span key={item} className="text-[4px] text-ink-500">
                  {item}
                </span>
              ))}
            </span>
            <span className="rounded-[1px] bg-ink-950 px-1 py-[1px] text-[4px] text-white">{MOCK.cta}</span>
          </div>
          <span className="h-px w-full bg-ink-200" />
        </Frame>
      );

    case 'hero':
      return (
        <Frame>
          <div className="flex flex-1 items-center gap-2">
            <div className="flex-1">
              <p className="text-[3.5px] font-semibold uppercase tracking-[0.1em] text-ink-400">Photography</p>
              <p
                className="mt-[2px] text-[6px] font-semibold leading-[1.1] text-ink-950"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {MOCK.headline}
              </p>
              <span className="mt-1 inline-block rounded-[1px] bg-ink-950 px-1 py-[1px] text-[3.5px] text-white">
                Book a session
              </span>
            </div>
            <MockImg src={MOCK.hero(160)} className="h-full w-1/2 rounded-[2px]" />
          </div>
        </Frame>
      );

    case 'features':
      return (
        <Frame>
          <p className="text-center text-[4px] font-semibold uppercase tracking-[0.12em] text-ink-400">What we do</p>
          <div className="flex flex-1 gap-1.5">
            {MOCK.services.map((service) => (
              <div key={service.title} className={`flex flex-1 flex-col gap-[2px] p-1 ${card}`}>
                <span className="h-1.5 w-1.5 rounded-[1px] bg-ink-900" />
                <span className="text-[4px] font-semibold leading-tight text-ink-900">{service.title}</span>
                <span className="text-[3.5px] leading-tight text-ink-500">{service.body}</span>
              </div>
            ))}
          </div>
        </Frame>
      );

    case 'gallery':
      return (
        <Frame>
          <div className="grid flex-1 grid-cols-3 grid-rows-2 gap-1">
            {[...MOCK.gallery(3, 120), ...MOCK.gallery(3, 120)].map((src, i) => (
              <MockImg key={i} src={src} className="h-full w-full rounded-[2px]" />
            ))}
          </div>
        </Frame>
      );

    case 'testimonials':
      return (
        <Frame>
          <div className="flex flex-1 gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`flex flex-1 flex-col gap-1 p-1 ${card}`}>
                <span className="text-[3.5px] leading-[1.35] text-ink-600">{MOCK.quote}</span>
                <span className="mt-auto flex items-center gap-1">
                  <MockImg src={MOCK.avatars(3)[i]} className="h-2 w-2 rounded-full" />
                  <span className="text-[3.5px] font-semibold text-ink-800">{MOCK.author}</span>
                </span>
              </div>
            ))}
          </div>
        </Frame>
      );

    case 'textMedia':
      return (
        <Frame>
          <div className="flex flex-1 items-center gap-2">
            <div className="flex-1">
              <p className="text-[5px] font-semibold leading-tight text-ink-900">Why people choose us</p>
              <span className={`mt-1 block h-[2px] w-full ${rule}`} />
              <span className={`mt-[2px] block h-[2px] w-full ${rule}`} />
              <span className={`mt-[2px] block h-[2px] w-2/3 ${rule}`} />
            </div>
            <MockImg src={MOCK.portrait(140)} className="h-full w-2/5 rounded-[2px]" />
          </div>
        </Frame>
      );

    case 'stats':
      return (
        <Frame className="justify-center">
          <div className="flex gap-2">
            {MOCK.stats.map((stat) => (
              <div key={stat.label} className="flex-1 text-center">
                <p className="text-[9px] font-semibold leading-none tracking-[-0.03em] text-ink-950">{stat.value}</p>
                <p className="mt-[2px] text-[3.5px] uppercase tracking-wider text-ink-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </Frame>
      );

    case 'logos':
      return (
        <Frame className="justify-center">
          <p className="text-center text-[3.5px] uppercase tracking-[0.14em] text-ink-400">Trusted by</p>
          <div className="mt-1 flex items-center justify-between gap-1.5">
            {MOCK.logos.map((name) => (
              <span key={name} className="text-[5px] font-semibold tracking-tight text-ink-400">
                {name}
              </span>
            ))}
          </div>
        </Frame>
      );

    default:
      return <SectionThumbExtra type={type} />;
  }
}

function SectionThumbExtra({ type }: { type: SectionType }) {
  switch (type) {
    case 'pricing':
      return (
        <Frame>
          <div className="flex flex-1 items-stretch gap-1.5">
            {MOCK.plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`flex flex-1 flex-col gap-[2px] rounded-[2px] p-1 ${
                  i === 1 ? 'bg-ink-950' : card
                }`}
              >
                <span className={`text-[3.5px] font-semibold ${i === 1 ? 'text-white/70' : 'text-ink-500'}`}>
                  {plan.name}
                </span>
                <span className={`text-[6px] font-semibold leading-none ${i === 1 ? 'text-white' : 'text-ink-950'}`}>
                  {plan.price}
                </span>
                <span className={`mt-auto h-[2px] w-full rounded-[1px] ${i === 1 ? 'bg-white/25' : 'bg-ink-200'}`} />
                <span className={`h-[2px] w-2/3 rounded-[1px] ${i === 1 ? 'bg-white/25' : 'bg-ink-200'}`} />
              </div>
            ))}
          </div>
        </Frame>
      );

    case 'team':
      return (
        <Frame>
          <div className="flex flex-1 items-center gap-2">
            {MOCK.team.map((person, i) => (
              <div key={person.name} className="flex flex-1 flex-col items-center gap-[2px]">
                <MockImg src={MOCK.avatars(3)[i]} className="h-5 w-5 rounded-full" />
                <span className="text-[3.5px] font-semibold leading-tight text-ink-900">{person.name}</span>
                <span className="text-[3px] leading-tight text-ink-500">{person.role}</span>
              </div>
            ))}
          </div>
        </Frame>
      );

    case 'faq':
      return (
        <Frame className="justify-center gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`flex items-center gap-1.5 px-1 py-[3px] ${card}`}>
              <span className="flex-1 truncate text-[3.5px] text-ink-700">{MOCK.question}</span>
              <span className="text-[4px] font-bold text-ink-400">+</span>
            </div>
          ))}
        </Frame>
      );

    case 'contact':
      return (
        <Frame>
          <div className="flex flex-1 gap-2">
            <div className="flex-1">
              <p className="text-[4.5px] font-semibold leading-tight text-ink-900">Get in touch</p>
              <p className="mt-[2px] text-[3px] leading-tight text-ink-500">hello@aperture.com</p>
              <p className="text-[3px] leading-tight text-ink-500">+1 555 010 2030</p>
              <p className="text-[3px] leading-tight text-ink-500">Portland, OR</p>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <span className={`px-1 py-[2px] text-[3px] text-ink-400 ${card}`}>Name</span>
              <span className={`px-1 py-[2px] text-[3px] text-ink-400 ${card}`}>Email</span>
              <span className="mt-auto rounded-[1px] bg-ink-950 px-1 py-[2px] text-center text-[3.5px] text-white">
                Send
              </span>
            </div>
          </div>
        </Frame>
      );

    case 'cta':
      return (
        <Frame className="justify-center">
          <div className="flex flex-col items-center gap-1 rounded-[2px] bg-ink-950 px-2 py-2">
            <span className="text-[5px] font-semibold leading-tight text-white">Ready to start?</span>
            <span className="text-[3px] leading-tight text-white/60">Book a 20-minute call</span>
            <span className="mt-[2px] rounded-[1px] bg-white px-1.5 py-[2px] text-[3.5px] font-semibold text-ink-950">
              Book a call
            </span>
          </div>
        </Frame>
      );

    case 'footer':
      return (
        <Frame className="justify-end">
          <div className="flex gap-2.5">
            <div className="flex-1">
              <span className="text-[4.5px] font-bold tracking-tight text-ink-900">{MOCK.brand}</span>
              <span className={`mt-1 block h-[2px] w-full ${rule}`} />
            </div>
            {['Company', 'Explore'].map((title) => (
              <div key={title} className="flex-1">
                <span className="text-[3px] uppercase tracking-wider text-ink-400">{title}</span>
                <span className="mt-[2px] block text-[3px] leading-[1.5] text-ink-500">About</span>
                <span className="block text-[3px] leading-[1.5] text-ink-500">Contact</span>
              </div>
            ))}
          </div>
          <span className="mt-1 block h-px w-full bg-ink-200" />
          <span className="text-[3px] text-ink-400">© 2026 {MOCK.brand}</span>
        </Frame>
      );

    default:
      return <Frame>{null}</Frame>;
  }
}
