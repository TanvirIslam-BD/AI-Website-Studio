import { ArrowUp, Check, FileStack, Monitor, Smartphone, Tablet } from 'lucide-react';
import { OPERATION_NAMES } from '@/lib/website/operations';
import { SECTION_META, SECTION_TYPES } from '@/lib/website/sections';
import { THEME_PRESETS, resolveTheme, themeSchema } from '@/lib/website/theme';
import { cn } from '@/lib/utils';
import { Band, Container, Heading } from './primitives';

/**
 * Features as a bento grid.
 *
 * Tile sizes carry the hierarchy: the copilot is the widest because it is the
 * part that differs most from other builders. The counts and lists render from
 * the product's own registries - operations, section types, brand presets - so
 * the page cannot describe more than the product has.
 */

function Tile({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div
      className={cn('glass reveal relative overflow-hidden rounded-3xl p-7 sm:p-8', className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function TileTitle({ title, body }: { title: string; body: string }) {
  return (
    <>
      <h3 className="text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] text-white">{title}</h3>
      <p className="mt-2.5 max-w-md text-[14px] leading-relaxed text-white/50">{body}</p>
    </>
  );
}

function CopilotTile() {
  return (
    <Tile className="lg:col-span-2 lg:row-span-2">
      <TileTitle
        title="A copilot that edits. It never regenerates."
        body="Ask for a change in plain language. It applies exactly that change to the section you selected, through validated operations - the rest of your site is left alone."
      />

      <div className="mt-8 rounded-2xl border border-white/10 bg-[#09090d] p-4 sm:p-5">
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-2xl rounded-br-md bg-white px-4 py-2.5 text-[13px] font-medium text-[#07070a]">
            Make this section more premium and raise the contrast on the button.
          </p>
        </div>
        <div className="mt-4 max-w-[90%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[13px] leading-relaxed text-white/80">
            Switched the heading to a display face, opened up the spacing and darkened the call to action.
          </p>
          <ul className="mt-3 space-y-1.5 font-mono text-[11px] text-sky-200/80">
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5" aria-hidden /> update_section · variant, heading
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5" aria-hidden /> update_theme · headingFont
            </li>
          </ul>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-4 pr-2">
          <span className="flex-1 text-[13px] text-white/35">Ask for a change...</span>
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-[#07070a]" aria-hidden>
            <ArrowUp className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[12px] font-medium text-white/40">{OPERATION_NAMES.length} validated operations</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {OPERATION_NAMES.map((name) => (
            <li
              key={name}
              className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[10.5px] text-white/50"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </Tile>
  );
}

function SectionsTile() {
  return (
    <Tile delay={60}>
      <div id="sections" className="scroll-mt-28">
        <TileTitle
          title={`${SECTION_TYPES.length} section types`}
          body="Real layouts with typed fields, so every heading, image and link can be changed without breaking the page."
        />
      </div>
      <ul className="mt-6 flex flex-wrap gap-1.5">
        {SECTION_TYPES.map((type) => (
          <li key={type} className="rounded-full border border-white/10 px-2.5 py-1 text-[12px] text-white/60">
            {SECTION_META[type].label}
          </li>
        ))}
      </ul>
    </Tile>
  );
}

function BrandTile() {
  return (
    <Tile delay={120}>
      <TileTitle
        title="Brand kits, not colour pickers"
        body="Type, colour, radius and spacing, generated with the site and applied everywhere at once."
      />
      <ul className="mt-6 grid grid-cols-3 gap-2">
        {THEME_PRESETS.slice(0, 6).map((preset) => {
          const t = resolveTheme(themeSchema.parse(preset.patch));
          return (
            <li
              key={preset.id}
              className="overflow-hidden rounded-xl border border-white/10"
              style={{ background: t.background }}
              title={preset.name}
            >
              <div className="flex h-12 items-end gap-1 p-2">
                <span className="h-4 w-4 rounded-full" style={{ background: t.primary }} />
                <span className="h-4 w-4 rounded-full" style={{ background: t.secondary }} />
              </div>
              <p className="truncate px-2 pb-1.5 text-[10px] font-medium" style={{ color: t.muted }}>
                {preset.name}
              </p>
            </li>
          );
        })}
      </ul>
    </Tile>
  );
}

function SpeedTile() {
  return (
    <Tile className="lg:col-span-1" delay={60}>
      <p className="text-gradient text-[4rem] font-semibold leading-none tracking-[-0.06em]">0 KB</p>
      <p className="mt-2 text-[14px] font-medium text-white">of JavaScript shipped</p>
      <p className="mt-2.5 text-[14px] leading-relaxed text-white/50">
        Deployed sites are plain HTML with one precompiled stylesheet. Nothing to hydrate, nothing to break.
      </p>
      <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-5">
        <div>
          <dt className="text-[11px] text-white/40">Four-page site</dt>
          <dd className="mt-1 text-[1.25rem] font-semibold tracking-[-0.03em] text-white">~110 KB</dd>
        </div>
        <div>
          <dt className="text-[11px] text-white/40">Precompiled CSS</dt>
          <dd className="mt-1 text-[1.25rem] font-semibold tracking-[-0.03em] text-white">13 KB</dd>
        </div>
      </dl>
    </Tile>
  );
}

function ScreensTile() {
  return (
    <Tile delay={120}>
      <TileTitle
        title="Right at every width"
        body="Preview desktop, tablet and phone at real breakpoints while you edit, so what you see is what deploys."
      />
      <div className="mt-7 flex items-end justify-center gap-4 text-white/70" aria-hidden>
        <div className="flex flex-col items-center gap-2">
          <div className="h-20 w-32 rounded-lg border border-white/15 bg-gradient-to-br from-white/[0.08] to-transparent" />
          <Monitor className="h-3.5 w-3.5 text-white/35" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-12 rounded-lg border border-white/15 bg-gradient-to-br from-white/[0.08] to-transparent" />
          <Tablet className="h-3.5 w-3.5 text-white/35" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-7 rounded-md border border-white/15 bg-gradient-to-br from-white/[0.08] to-transparent" />
          <Smartphone className="h-3.5 w-3.5 text-white/35" />
        </div>
      </div>
    </Tile>
  );
}

function PagesTile() {
  return (
    <Tile delay={180}>
      <TileTitle
        title="Multi-page from the start"
        body="Home, About, Services and Contact with a shared header, footer and brand. Add, remove and reorder pages whenever you like."
      />
      <ul className="mt-6 space-y-2">
        {['Home', 'About', 'Services', 'Contact'].map((page, i) => (
          <li
            key={page}
            className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[13px] text-white/70"
          >
            <FileStack className="h-3.5 w-3.5 text-white/35" aria-hidden />
            {page}
            <span className="ml-auto font-mono text-[10px] text-white/30">/{i === 0 ? '' : page.toLowerCase()}</span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

export function Bento() {
  return (
    <Band id="features">
      <Container>
        <Heading
          kicker="Features"
          title="Everything a real website needs. Nothing it doesn't."
          lede="Built for the part after launch, when the site has to be changed, kept on brand and kept fast."
        />

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          <CopilotTile />
          <SectionsTile />
          <BrandTile />
          <SpeedTile />
          <ScreensTile />
          <PagesTile />
        </div>
      </Container>
    </Band>
  );
}
