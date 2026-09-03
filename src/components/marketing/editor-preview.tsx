import { Image as ImageIcon, Layers, Monitor, Palette, Rocket, Smartphone, Sparkles, Tablet } from 'lucide-react';

/**
 * A styled representation of the editor's three-pane layout.
 *
 * Deliberately built from real markup rather than a screenshot: it stays sharp
 * at any width, adapts to the page, and cannot go stale in the way a captured
 * image does.
 */

const PANELS = [
  { icon: Layers, label: 'Sections' },
  { icon: ImageIcon, label: 'Assets' },
  { icon: Palette, label: 'Theme' },
];

const SECTION_LIST = [
  { name: 'Header', detail: 'Aperture & Light' },
  { name: 'Hero', detail: 'Photographs that feel like you' },
  { name: 'Gallery', detail: 'Selected work' },
  { name: 'Testimonials', detail: 'What clients say' },
  { name: 'Contact', detail: 'Tell us about your project' },
];

export function EditorPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-pop">
      <TopBar />
      <div className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[140px_minmax(0,1fr)_152px]">
        <LeftRail />
        <CanvasMock />
        <CopilotMock />
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex items-center gap-3 border-b border-ink-200/80 bg-white px-3 py-2.5">
      <span className="grid h-6 w-6 place-items-center rounded-md bg-ink-900 text-[10px] font-black text-white">W</span>
      <span className="text-[12px] font-semibold text-ink-900">Aperture &amp; Light</span>
      <span className="hidden text-[10px] text-ink-400 sm:inline">Saved</span>

      <span className="mx-auto flex items-center gap-0.5 rounded-md bg-ink-100 p-0.5">
        <span className="grid h-5 w-6 place-items-center rounded bg-white text-ink-800 shadow-sm">
          <Monitor className="h-3 w-3" />
        </span>
        <span className="grid h-5 w-6 place-items-center rounded text-ink-400">
          <Tablet className="h-3 w-3" />
        </span>
        <span className="grid h-5 w-6 place-items-center rounded text-ink-400">
          <Smartphone className="h-3 w-3" />
        </span>
      </span>

      <span className="hidden rounded-md border border-ink-200 px-2 py-1 text-[10px] font-medium text-ink-600 sm:inline">
        Preview
      </span>
      <span className="inline-flex items-center gap-1 rounded-md bg-ink-900 px-2 py-1 text-[10px] font-medium text-white">
        <Rocket className="h-2.5 w-2.5" /> Deploy
      </span>
    </div>
  );
}

function LeftRail() {
  return (
    <div className="hidden flex-col border-r border-ink-200/80 bg-white sm:flex">
      <div className="flex border-b border-ink-200/80">
        {PANELS.map((panel, i) => (
          <span
            key={panel.label}
            className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[8px] font-semibold uppercase tracking-wide ${
              i === 0 ? 'border-b-2 border-ink-900 text-ink-900' : 'text-ink-400'
            }`}
          >
            <panel.icon className="h-2.5 w-2.5" />
            {panel.label}
          </span>
        ))}
      </div>
      <div className="grid gap-0.5 p-1.5">
        {SECTION_LIST.map((section, i) => (
          <span key={section.name} className={`flex items-center gap-1.5 rounded px-1.5 py-1 ${i === 1 ? 'bg-brand-50' : ''}`}>
            <span
              className={`grid h-4 w-4 shrink-0 place-items-center rounded text-[7px] font-bold ${
                i === 1 ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500'
              }`}
            >
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className={`block truncate text-[9px] font-medium ${i === 1 ? 'text-brand-800' : 'text-ink-700'}`}>
                {section.name}
              </span>
              <span className="block truncate text-[7px] text-ink-400">{section.detail}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function CanvasMock() {
  return (
    <div className="relative bg-ink-100/70 p-3 sm:p-4">
      <div className="studio-grid absolute inset-0 opacity-40" aria-hidden />
      <div className="relative overflow-hidden rounded-lg border border-ink-300/60 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-ink-100 px-3 py-2">
          <span className="text-[8px] font-bold tracking-tight text-ink-900">Aperture &amp; Light</span>
          <span className="hidden gap-2 sm:flex">
            {['Home', 'About', 'Work', 'Contact'].map((item) => (
              <span key={item} className="text-[6px] text-ink-400">
                {item}
              </span>
            ))}
          </span>
          <span className="rounded bg-ink-900 px-1.5 py-0.5 text-[6px] text-white">Get in touch</span>
        </div>

        {/* the selected section, with its overlay chrome */}
        <div className="relative ring-2 ring-inset ring-brand-500">
          <span className="absolute left-1.5 top-1.5 z-10 rounded bg-brand-600 px-1.5 py-0.5 text-[6px] font-semibold text-white">
            Hero
          </span>
          <div className="grid grid-cols-2 items-center gap-3 px-3 py-5">
            <div>
              <div className="h-1 w-10 rounded bg-brand-200" />
              <div className="mt-1.5 h-2 w-full rounded bg-ink-800" />
              <div className="mt-1 h-2 w-3/4 rounded bg-ink-800" />
              <div className="mt-2 h-1 w-full rounded bg-ink-200" />
              <div className="mt-0.5 h-1 w-2/3 rounded bg-ink-200" />
              <div className="mt-2.5 flex gap-1">
                <span className="h-3 w-12 rounded bg-ink-900" />
                <span className="h-3 w-10 rounded border border-ink-300" />
              </div>
            </div>
            <div className="aspect-[4/3] rounded bg-gradient-to-br from-ink-300 to-ink-500" />
          </div>
        </div>

        <div className="px-3 py-4">
          <div className="mx-auto h-1.5 w-20 rounded bg-ink-300" />
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-square rounded bg-ink-200" />
            ))}
          </div>
        </div>
      </div>

      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full border border-ink-200 bg-white/95 px-2 py-0.5 font-mono text-[7px] text-ink-500">
        1440px · 37%
      </span>
    </div>
  );
}

function CopilotMock() {
  return (
    <div className="hidden flex-col border-l border-ink-200/80 bg-white lg:flex">
      <div className="flex items-center gap-1.5 border-b border-ink-200/80 px-2 py-2">
        <Sparkles className="h-2.5 w-2.5 text-brand-600" />
        <span className="text-[9px] font-semibold text-ink-900">AI Copilot</span>
      </div>
      <div className="flex-1 space-y-2 p-2">
        <p className="ml-auto w-fit max-w-[94%] rounded-lg bg-ink-900 px-2 py-1.5 text-[8px] leading-snug text-white">
          Make the hero more premium
        </p>
        <p className="w-fit max-w-[94%] rounded-lg bg-ink-50 px-2 py-1.5 text-[8px] leading-snug text-ink-600 ring-1 ring-ink-200">
          Rewrote the headline, switched to a serif display font and opened up the spacing.
        </p>
        <p className="ml-auto w-fit max-w-[94%] rounded-lg bg-ink-900 px-2 py-1.5 text-[8px] leading-snug text-white">
          Add pricing after the gallery
        </p>
      </div>
      <div className="border-t border-ink-200/80 p-2">
        <div className="rounded-md border border-ink-200 px-2 py-1.5 text-[8px] text-ink-400">Ask for a change...</div>
      </div>
    </div>
  );
}
