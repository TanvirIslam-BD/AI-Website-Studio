import { generateFromTemplate } from '@/lib/ai/template';
import { PageView, ThemeScope } from '@/components/website/renderer';
import { homePage } from '@/lib/website/document';

/**
 * A real generated website, shown inside browser chrome.
 *
 * This is not a mockup: the document comes from the same generator the product
 * uses and renders through the same section components, so the hero literally
 * shows the output. Generated once at module scope - it is deterministic, so
 * there is no reason to rebuild it per request.
 */
const SHOWCASE = generateFromTemplate('a modern website for a photography business called Aperture & Light');

export function SiteShowcase() {
  const page = homePage(SHOWCASE.document);

  return (
    <div className="relative">
      {/* glow behind the frame */}
      <div
        // Kept inside the viewport on small screens: a negative inline inset
        // here was widening the document and causing horizontal scroll.
        className="absolute inset-x-0 -top-6 bottom-16 rounded-[2rem] opacity-60 blur-2xl md:-inset-x-8"
        style={{ background: 'linear-gradient(120deg, rgba(99,102,241,0.28), rgba(14,165,233,0.18) 60%, transparent)' }}
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-2xl border border-ink-300/70 bg-white shadow-pop">
        {/* browser chrome */}
        <div className="flex items-center gap-3 border-b border-ink-200 bg-ink-50 px-4 py-2.5">
          <span className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </span>
          <span className="mx-auto flex max-w-xs flex-1 items-center justify-center gap-1.5 rounded-md bg-white px-3 py-1 text-[11px] text-ink-500 ring-1 ring-ink-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            aperture-light.vercel.app
          </span>
          <span className="w-[52px]" />
        </div>

        {/*
          The site renders at desktop width and is scaled to fit. Media queries
          resolve against the real viewport, so this is desktop-only; small
          screens get the simpler image collage below instead.
        */}
        <div className="hidden h-[430px] overflow-hidden md:block lg:h-[520px]">
          <div className="w-[1440px] origin-top-left scale-[0.52] lg:scale-[0.63] xl:scale-[0.72]">
            <ThemeScope theme={SHOWCASE.document.theme}>
              <PageView page={page} theme={SHOWCASE.document.theme} hrefFor={() => '#'} />
            </ThemeScope>
          </div>
        </div>

        <MobileCollage />
      </div>
    </div>
  );
}

/** Small-screen stand-in: the same imagery, without the scaled desktop layout. */
function MobileCollage() {
  const images = SHOWCASE.document.assets.slice(0, 4);

  return (
    <div className="md:hidden">
      <div className="px-5 pt-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-600">
          Portrait &amp; editorial photography
        </p>
        <p className="mt-2 text-2xl font-bold leading-tight tracking-[-0.02em] text-ink-950">
          Aperture &amp; Light photographs the moments that matter
        </p>
        <span className="mt-4 inline-flex rounded-lg bg-ink-900 px-4 py-2 text-[12px] font-semibold text-white">
          Get started
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 p-5">
        {images.map((asset) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={asset.id} src={asset.url} alt="" className="aspect-square w-full rounded-lg object-cover" loading="lazy" />
        ))}
      </div>
    </div>
  );
}
