import { currentUser } from '@/lib/tenancy';
import { aiStatus } from '@/lib/ai';
import { googleFontsHrefFor, THEME_PRESETS, themeSchema } from '@/lib/website/theme';
import { MarketingNav } from '@/components/marketing/nav';
import { RevealProvider } from '@/components/marketing/reveal';
import { Hero } from '@/components/marketing/hero';
import { Audience } from '@/components/marketing/audience';
import { ProductShowcase } from '@/components/marketing/product';
import { StudioGallery } from '@/components/marketing/studio-gallery';
import { GeneratedSites } from '@/components/marketing/generated-sites';
import { TwoWays } from '@/components/marketing/two-ways';
import { EveryScreen } from '@/components/marketing/every-screen';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { Features } from '@/components/marketing/features';
import { CopilotShowcase } from '@/components/marketing/copilot-showcase';
import { Examples } from '@/components/marketing/examples';
import { SectionLibrary, BrandKits } from '@/components/marketing/library';
import { Deploy } from '@/components/marketing/deploy';
import { Pricing } from '@/components/marketing/pricing';
import { Faq } from '@/components/marketing/faq';
import { FinalCta, MarketingFooter } from '@/components/marketing/closing';

/**
 * The public marketing site.
 *
 * Ordered so the product is understood before it is argued for: the workflow
 * in the hero, the real thing at full size, who it is for, how it works, then
 * the detail. Several sections render from the product's own registries - the
 * section library, the operation list, the brand kit presets, the example
 * generator - so the page cannot describe a product that does not exist.
 */
export default async function HomePage() {
  const user = await currentUser();
  const ai = aiStatus();
  const signedIn = Boolean(user);

  // The brand-kit previews and the hero showcase render in the presets' real
  // typefaces, so the page loads those families itself.
  const presetFonts = THEME_PRESETS.flatMap((preset) => {
    const theme = themeSchema.parse(preset.patch);
    return [theme.headingFont, theme.bodyFont];
  });
  const fontsHref = googleFontsHrefFor(presetFonts);

  // `overflow-x-clip`, not `hidden`. Both stop a wide child widening the page,
  // but `hidden` makes this a scroll container - and a scroll container becomes
  // the containing block for sticky descendants, so the sticky nav scrolled away
  // with the content instead of pinning. `clip` clips without that side effect.
  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      {fontsHref ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={fontsHref} />
        </>
      ) : null}

      <RevealProvider />
      {/* The home page opens on a dark hero, so the bar starts inverted. */}
      <MarketingNav signedIn={signedIn} tone="dark" />

      <main>
        <Hero providerLabel={ai.configured ? ai.label : null} signedIn={signedIn} />
        {/*
          Second, directly after the hero. Most visitors arrive already using a
          block editor or comparing against one, so the difference is the first
          thing worth settling - before the page spends five sections on detail
          they have no reason to read yet.
        */}
        <TwoWays />
        <Audience />
        <ProductShowcase />
        <StudioGallery />
        <GeneratedSites signedIn={signedIn} />
        <EveryScreen />
        <HowItWorks />
        <Features />
        <CopilotShowcase />
        <Examples signedIn={signedIn} />
        <SectionLibrary />
        <BrandKits />
        <Deploy />
        <Pricing />
        <Faq />
        <FinalCta signedIn={signedIn} />
      </main>

      <MarketingFooter />
    </div>
  );
}
