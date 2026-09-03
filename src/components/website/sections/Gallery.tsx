import type { SectionOfType } from '@/lib/website/sections';
import { Container, GRID_COLUMNS, Img, Prose, SectionShell, type SectionViewProps } from '../primitives';
import { SectionHead } from './SectionHead';

export function GallerySection({ section }: SectionViewProps<SectionOfType<'gallery'>>) {
  const { images, columns, variant } = section;

  return (
    <SectionShell background={section.background} paddingY={section.paddingY} id="work">
      <Container wide>
        <SectionHead eyebrow={section.eyebrow} heading={section.heading} subheading={section.subheading} />

        {variant === 'filmstrip' ? (
          <div className="mt-12 flex snap-x gap-5 overflow-x-auto pb-4">
            {images.map((image, i) => (
              <figure key={i} className="w-[300px] shrink-0 snap-start sm:w-[380px]">
                <Img src={image.url} alt={image.alt} ratio="4/5" className="w-full" />
                {image.caption ? (
                  <Prose size="sm" className="mt-2.5">
                    {image.caption}
                  </Prose>
                ) : null}
              </figure>
            ))}
          </div>
        ) : variant === 'masonry' ? (
          <div className="mt-12 columns-2 lg:columns-3" style={{ columnGap: 'var(--ws-gap)' }}>
            {images.map((image, i) => (
              <figure key={i} className="mb-5 break-inside-avoid">
                <Img src={image.url} alt={image.alt} className="w-full" style={{ aspectRatio: i % 3 === 0 ? '3/4' : '1/1' }} />
                {image.caption ? (
                  <Prose size="sm" className="mt-2">
                    {image.caption}
                  </Prose>
                ) : null}
              </figure>
            ))}
          </div>
        ) : (
          <div className={`mt-12 grid ${GRID_COLUMNS[columns] ?? GRID_COLUMNS[3]}`} style={{ gap: 'var(--ws-gap)' }}>
            {images.map((image, i) => (
              <figure key={i}>
                <Img src={image.url} alt={image.alt} ratio="1/1" className="w-full" />
                {image.caption ? (
                  <Prose size="sm" className="mt-2.5">
                    {image.caption}
                  </Prose>
                ) : null}
              </figure>
            ))}
          </div>
        )}
      </Container>
    </SectionShell>
  );
}
