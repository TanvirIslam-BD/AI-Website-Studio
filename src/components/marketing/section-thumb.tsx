import type { SectionType } from '@/lib/website/sections';

/**
 * Miniature layout diagrams for each section type.
 *
 * Abstract on purpose: they communicate structure at a glance without
 * pretending to be screenshots, and they cost nothing to load.
 */

const bar = 'rounded-[2px] bg-ink-300';
const dark = 'rounded-[2px] bg-ink-500';
const box = 'rounded-[3px] bg-ink-200';
const accent = 'rounded-[2px] bg-brand-400';
const card = 'rounded-[3px] bg-white ring-1 ring-inset ring-ink-200';

function Frame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`flex h-[74px] w-full flex-col gap-1.5 rounded-lg bg-ink-50 p-2.5 ring-1 ring-inset ring-ink-200/70 ${className}`}
    >
      {children}
    </div>
  );
}

const Row = ({ n, cls }: { n: number; cls: string }) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} className={cls} />
    ))}
  </>
);

export function SectionThumb({ type }: { type: SectionType }) {
  switch (type) {
    case 'header':
      return (
        <Frame className="justify-start">
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 ${dark}`} />
            <span className={`h-1 w-4 ${bar}`} />
            <span className="ml-auto flex gap-1">
              <Row n={3} cls={`h-1 w-3 ${bar}`} />
            </span>
            <span className={`h-2.5 w-6 ${accent}`} />
          </div>
        </Frame>
      );
    case 'hero':
      return (
        <Frame>
          <div className="flex flex-1 items-center gap-2">
            <div className="flex-1 space-y-1">
              <span className={`block h-1 w-4 ${accent}`} />
              <span className={`block h-2 w-full ${dark}`} />
              <span className={`block h-2 w-3/4 ${dark}`} />
              <span className={`mt-1 block h-2.5 w-8 ${dark}`} />
            </div>
            <div className={`h-full w-1/2 ${box}`} />
          </div>
        </Frame>
      );
    case 'features':
      return (
        <Frame>
          <span className={`mx-auto h-1.5 w-12 ${dark}`} />
          <div className="flex flex-1 gap-1.5">
            <Row n={3} cls={`flex-1 ${box}`} />
          </div>
        </Frame>
      );
    case 'gallery':
      return (
        <Frame>
          <div className="grid flex-1 grid-cols-3 grid-rows-2 gap-1">
            <Row n={6} cls={box} />
          </div>
        </Frame>
      );
    case 'testimonials':
      return (
        <Frame>
          <div className="flex flex-1 gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`flex flex-1 flex-col gap-1 p-1.5 ${card}`}>
                <span className={`h-1 w-full ${bar}`} />
                <span className={`h-1 w-2/3 ${bar}`} />
                <span className="mt-auto h-2 w-2 rounded-full bg-ink-300" />
              </div>
            ))}
          </div>
        </Frame>
      );
    case 'textMedia':
      return (
        <Frame>
          <div className="flex flex-1 items-center gap-2">
            <div className="flex-1 space-y-1">
              <span className={`block h-1.5 w-3/4 ${dark}`} />
              <span className={`block h-1 w-full ${bar}`} />
              <span className={`block h-1 w-full ${bar}`} />
              <span className={`block h-1 w-2/3 ${bar}`} />
            </div>
            <div className={`h-full w-2/5 ${box}`} />
          </div>
        </Frame>
      );
    case 'stats':
      return (
        <Frame className="justify-center">
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex-1 space-y-1">
                <span className={`block h-3 w-full ${accent}`} />
                <span className={`block h-1 w-3/4 ${bar}`} />
              </div>
            ))}
          </div>
        </Frame>
      );
    case 'logos':
      return (
        <Frame className="justify-center">
          <div className="flex items-center gap-2">
            <Row n={5} cls={`h-2 flex-1 ${bar}`} />
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
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`flex flex-1 flex-col gap-1 rounded-[3px] p-1.5 ${
                  i === 1 ? 'bg-brand-100 ring-1 ring-inset ring-brand-300' : card
                }`}
              >
                <span className={`h-2 w-1/2 ${i === 1 ? accent : dark}`} />
                <span className={`h-1 w-full ${bar}`} />
                <span className={`h-1 w-3/4 ${bar}`} />
              </div>
            ))}
          </div>
        </Frame>
      );
    case 'team':
      return (
        <Frame>
          <div className="flex flex-1 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="h-6 w-6 rounded-full bg-ink-200" />
                <span className={`h-1 w-full ${bar}`} />
                <span className={`h-1 w-2/3 ${bar}`} />
              </div>
            ))}
          </div>
        </Frame>
      );
    case 'faq':
      return (
        <Frame className="justify-center gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`flex items-center gap-1.5 px-1.5 py-1 ${card}`}>
              <span className={`h-1 flex-1 ${bar}`} />
              <span className={`h-1.5 w-1.5 ${accent}`} />
            </div>
          ))}
        </Frame>
      );
    case 'contact':
      return (
        <Frame>
          <div className="flex flex-1 gap-2">
            <div className="flex-1 space-y-1">
              <span className={`block h-1.5 w-2/3 ${dark}`} />
              <span className={`block h-1 w-full ${bar}`} />
              <span className={`block h-1 w-3/4 ${bar}`} />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <span className={`h-2 ${card}`} />
              <span className={`h-2 ${card}`} />
              <span className={`mt-auto h-2.5 w-8 ${accent}`} />
            </div>
          </div>
        </Frame>
      );
    case 'cta':
      return (
        <Frame className="justify-center">
          <div className="flex flex-col items-center gap-1.5 rounded-[3px] bg-brand-100 p-2">
            <span className={`h-1.5 w-16 ${dark}`} />
            <span className={`h-1 w-24 ${bar}`} />
            <span className={`h-2.5 w-10 ${accent}`} />
          </div>
        </Frame>
      );
    case 'footer':
      return (
        <Frame className="justify-end">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <span className={`block h-1.5 w-8 ${dark}`} />
              <span className={`block h-1 w-full ${bar}`} />
            </div>
            {[0, 1].map((i) => (
              <div key={i} className="flex-1 space-y-1">
                <span className={`block h-1 w-2/3 ${bar}`} />
                <span className={`block h-1 w-1/2 ${bar}`} />
                <span className={`block h-1 w-1/2 ${bar}`} />
              </div>
            ))}
          </div>
        </Frame>
      );
    default:
      return <Frame>{null}</Frame>;
  }
}
