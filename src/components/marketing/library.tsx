import { SECTION_META, SECTION_TYPES } from '@/lib/website/sections';
import { FONTS, THEME_PRESETS, resolveTheme, themeSchema } from '@/lib/website/theme';
import { Container, Section, SectionHeading } from './shell';
import { SectionThumb } from './section-thumb';

/**
 * Section library and brand kits, both rendered from the product's own
 * registries. Add a section type or a preset and this page updates itself.
 */

const GROUP_LABEL = {
  structure: 'Structure',
  content: 'Content',
  social: 'Social proof',
  convert: 'Conversion',
} as const;

export function SectionLibrary() {
  const groups = (Object.keys(GROUP_LABEL) as Array<keyof typeof GROUP_LABEL>).map((group) => ({
    group,
    types: SECTION_TYPES.filter((type) => SECTION_META[type].group === group),
  }));

  return (
    <Section id="sections" tone="muted">
      <Container>
        <SectionHeading
          eyebrow="Section library"
          title={`${SECTION_TYPES.length} section types. Real layouts. *Fully editable.*`}
          body="Sections are typed and validated, so the AI can only ever produce a layout that actually renders - and you can always take over by hand."
        />

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map(({ group, types }) => (
            <div key={group}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">{GROUP_LABEL[group]}</h3>
              <ul className="mt-3 grid gap-2">
                {types.map((type) => (
                  <li key={type} className="overflow-hidden rounded-xl border border-ink-200 bg-white">
                    <div className="p-2">
                      <SectionThumb type={type} />
                    </div>
                    <div className="px-3.5 pb-3.5">
                      <p className="text-[13px] font-semibold text-ink-900">{SECTION_META[type].label}</p>
                      {/* Clamped so cards keep a common height and the grid reads as a grid. */}
                      <p className="mt-1 line-clamp-2 min-h-[32px] text-[12px] leading-relaxed text-ink-500">
                        {SECTION_META[type].description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function BrandKits() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Brand kit"
          title="A complete *brand system,* generated with your site"
          body="Typography, colour, spacing, radius and button style - applied consistently across every section, and swappable in one click."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {THEME_PRESETS.map((preset) => {
            const theme = themeSchema.parse(preset.patch);
            const t = resolveTheme(theme);
            const category = FONTS.find((font) => font.name === theme.headingFont)?.category ?? 'sans';

            return (
              <figure
                key={preset.id}
                className="reveal overflow-hidden rounded-xl border border-ink-200"
                style={{ background: t.background, filter: 'grayscale(1)' }}
              >
                <div className="p-6" style={{ color: t.text }}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: t.primary }}>
                    {preset.name}
                  </p>
                  <p
                    className="mt-3 text-2xl font-bold leading-tight tracking-[-0.02em]"
                    style={{ fontFamily: `'${theme.headingFont}', ${category === 'serif' ? 'serif' : 'sans-serif'}` }}
                  >
                    A headline in {theme.headingFont}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed" style={{ color: t.muted }}>
                    Body copy set in {theme.bodyFont}, on the surface colour this kit uses for cards and bands.
                  </p>

                  <div className="mt-5 flex items-center gap-2">
                    <span
                      className="px-3.5 py-2 text-[12px] font-semibold"
                      style={{
                        background: theme.buttonStyle === 'outline' ? 'transparent' : t.primary,
                        color: theme.buttonStyle === 'outline' ? t.primary : t.primaryFg,
                        border: `1px solid ${t.primary}`,
                        borderRadius: theme.buttonStyle === 'pill' ? '9999px' : t.radii.md,
                      }}
                    >
                      Primary
                    </span>
                    <span
                      className="px-3.5 py-2 text-[12px] font-medium"
                      style={{ border: `1px solid ${t.border}`, borderRadius: t.radii.md, color: t.text }}
                    >
                      Secondary
                    </span>
                  </div>
                </div>

                <figcaption
                  className="flex items-center gap-2 border-t px-6 py-3"
                  style={{ background: t.surface, borderColor: t.border }}
                >
                  {[t.primary, t.secondary, t.surface, t.text].map((colour, i) => (
                    <span
                      key={i}
                      className="h-4 w-4 rounded-full"
                      style={{ background: colour, border: `1px solid ${t.border}`, filter: 'grayscale(1)' }}
                    />
                  ))}
                  <span className="ml-auto font-mono text-[10px] uppercase" style={{ color: t.muted }}>
                    {theme.radius} · {theme.buttonStyle}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
