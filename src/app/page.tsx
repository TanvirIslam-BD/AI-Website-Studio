import type { Viewport } from 'next';
import { currentUser } from '@/lib/tenancy';
import { googleFontsHrefFor, THEME_PRESETS, themeSchema } from '@/lib/website/theme';
import { RevealProvider } from '@/components/marketing/reveal';
import { geist } from '@/components/home/primitives';
import { HomeNav } from '@/components/home/nav';
import { Hero } from '@/components/home/hero';
import { Showcase } from '@/components/home/showcase';
import { Workflow } from '@/components/home/workflow';
import { Bento } from '@/components/home/bento';
import { Ownership } from '@/components/home/ownership';
import { Pricing } from '@/components/home/pricing';
import { Faq } from '@/components/home/faq';
import { FinalCta, Footer } from '@/components/home/closing';

/** The home page is dark end to end, so the browser chrome should match it. */
export const viewport: Viewport = { themeColor: '#07070a' };

/**
 * The public home page.
 *
 * One dark surface, in the order a visitor decides: what it is and where to
 * start (hero, with the real editor under it), proof in the form of real
 * output, how it works, what it can do, who owns the result, then price and
 * questions. The showcase, section list, brand kits and operation list render
 * from the product's own registries, so the page cannot describe a product
 * that does not exist.
 */
export default async function HomePage() {
  const user = await currentUser();
  const signedIn = Boolean(user);

  // Generated sites and brand-kit swatches render in the presets' real
  // typefaces, so the page loads those families itself.
  const presetFonts = THEME_PRESETS.flatMap((preset) => {
    const theme = themeSchema.parse(preset.patch);
    return [theme.headingFont, theme.bodyFont];
  });
  const fontsHref = googleFontsHrefFor(presetFonts);

  // `overflow-x-clip`, not `hidden`: `hidden` would make this a scroll
  // container, which breaks the sticky FAQ column.
  return (
    <div className={`${geist.className} home-page min-h-screen overflow-x-clip bg-[#07070a] text-white antialiased`}>
      {fontsHref ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={fontsHref} />
        </>
      ) : null}

      <RevealProvider />
      <HomeNav signedIn={signedIn} />

      <main>
        <Hero signedIn={signedIn} />
        <Showcase />
        <Workflow />
        <Bento />
        <Ownership />
        <Pricing signedIn={signedIn} />
        <Faq />
        <FinalCta signedIn={signedIn} />
      </main>

      <Footer />
    </div>
  );
}
