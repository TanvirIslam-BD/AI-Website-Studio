'use client';

import { Palette, Sparkles, Type } from 'lucide-react';
import {
  BUTTON_STYLES,
  DENSITIES,
  FONTS,
  RADIUS_SCALE,
  THEME_MODES,
  THEME_PRESETS,
  type Theme,
} from '@/lib/website/theme';
import { THEME_QUICK_ACTIONS } from '@/lib/ai/agent';
import { ColorInput, Select } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { useEditor } from '../store';

const COLOR_FIELDS: Array<{ key: keyof Theme; label: string }> = [
  { key: 'primaryColor', label: 'Primary' },
  { key: 'secondaryColor', label: 'Secondary' },
  { key: 'background', label: 'Background' },
  { key: 'surface', label: 'Surface' },
  { key: 'textColor', label: 'Text' },
  { key: 'mutedColor', label: 'Muted text' },
  { key: 'borderColor', label: 'Borders' },
];

/**
 * Brand kit editor. Writes through `update_theme`, the same operation the
 * copilot calls, so "make it darker" and moving a colour picker are the same
 * change from the document's point of view.
 */
export function ThemePanel({ onAskAi }: { onAskAi: (instruction: string) => void }) {
  const theme = useEditor((state) => state.document.theme);
  const run = useEditor((state) => state.run);
  const copilotBusy = useEditor((state) => state.copilotBusy);

  const set = (patch: Partial<Theme>) => run('update_theme', patch);

  return (
    <div className="studio-scroll h-full overflow-y-auto">
      <Section title="Brand kits" icon={<Sparkles className="h-3.5 w-3.5" />}>
        <div className="grid grid-cols-2 gap-1.5">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => set(preset.patch as Partial<Theme>)}
              className="group rounded-lg border border-ink-200 bg-white p-2 text-left transition-colors hover:border-brand-300"
            >
              <span className="flex gap-1">
                {[preset.patch.primaryColor, preset.patch.secondaryColor, preset.patch.background ?? '#ffffff'].map((color, i) => (
                  <span
                    key={i}
                    className="h-4 w-4 rounded-full border border-ink-200"
                    style={{ background: color as string }}
                  />
                ))}
              </span>
              <span className="mt-1.5 block truncate text-[11px] font-medium text-ink-700">{preset.name}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Ask AI" icon={<Sparkles className="h-3.5 w-3.5" />}>
        <div className="flex flex-wrap gap-1.5">
          {THEME_QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              disabled={copilotBusy}
              onClick={() => onAskAi(action.instruction)}
              className={cn(
                'rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-600 transition-colors',
                'hover:border-brand-300 hover:text-brand-700 disabled:opacity-50',
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Colours" icon={<Palette className="h-3.5 w-3.5" />}>
        <div className="grid gap-1.5">
          {COLOR_FIELDS.map((field) => (
            <ColorInput
              key={field.key}
              label={field.label}
              value={String(theme[field.key] ?? '')}
              onChange={(value) => set({ [field.key]: value } as Partial<Theme>)}
            />
          ))}
        </div>
      </Section>

      <Section title="Typography" icon={<Type className="h-3.5 w-3.5" />}>
        <div className="grid gap-2.5">
          <Labelled label="Heading font">
            <Select value={theme.headingFont} onChange={(event) => set({ headingFont: event.target.value })}>
              {FONTS.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.name} · {font.category}
                </option>
              ))}
            </Select>
          </Labelled>
          <Labelled label="Body font">
            <Select value={theme.bodyFont} onChange={(event) => set({ bodyFont: event.target.value })}>
              {FONTS.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.name} · {font.category}
                </option>
              ))}
            </Select>
          </Labelled>
          <div
            className="rounded-lg border border-ink-200 p-3"
            style={{ background: theme.background, color: theme.textColor }}
          >
            <p className="text-lg font-bold leading-tight" style={{ fontFamily: `'${theme.headingFont}', sans-serif` }}>
              Headline preview
            </p>
            <p className="mt-1 text-[12px] leading-relaxed" style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.mutedColor }}>
              Body copy renders in the body font, muted colour.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Shape and spacing">
        <div className="grid gap-2.5">
          <Labelled label="Corner radius">
            <Select value={theme.radius} onChange={(event) => set({ radius: event.target.value as Theme['radius'] })}>
              {RADIUS_SCALE.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Labelled>
          <Labelled label="Button style">
            <Select value={theme.buttonStyle} onChange={(event) => set({ buttonStyle: event.target.value as Theme['buttonStyle'] })}>
              {BUTTON_STYLES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Labelled>
          <Labelled label="Density">
            <Select value={theme.density} onChange={(event) => set({ density: event.target.value as Theme['density'] })}>
              {DENSITIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Labelled>
          <Labelled label="Mode">
            <Select value={theme.mode} onChange={(event) => set({ mode: event.target.value as Theme['mode'] })}>
              {THEME_MODES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Labelled>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b border-ink-100 px-3 py-3.5">
      <h3 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-500">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</span>
      {children}
    </div>
  );
}
