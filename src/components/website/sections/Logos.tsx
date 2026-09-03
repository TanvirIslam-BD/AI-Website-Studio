import type { SectionOfType } from '@/lib/website/sections';
import { Container, Img, SectionShell, type SectionViewProps } from '../primitives';

export function LogosSection({ section }: SectionViewProps<SectionOfType<'logos'>>) {
  return (
    <SectionShell background={section.background} paddingY={section.paddingY}>
      <Container wide>
        {section.heading ? (
          <p
            className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ fontFamily: 'var(--ws-font-body)', opacity: 0.55 }}
          >
            {section.heading}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {section.items.map((item, i) =>
            item.image?.url ? (
              <Img key={i} src={item.image.url} alt={item.image.alt || item.name} className="h-7 w-auto" style={{ borderRadius: 0, opacity: 0.7 }} />
            ) : (
              <span
                key={i}
                className="text-lg font-semibold tracking-[-0.01em]"
                style={{ fontFamily: 'var(--ws-font-heading)', opacity: 0.45 }}
              >
                {item.name}
              </span>
            ),
          )}
        </div>
      </Container>
    </SectionShell>
  );
}
