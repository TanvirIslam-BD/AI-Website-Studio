import { currentUser } from '@/lib/tenancy';
import { googleFontsHrefFor, THEME_PRESETS, themeSchema } from '@/lib/website/theme';
import { aiStatus } from '@/lib/ai';
import { MarketingNav } from '@/components/marketing/nav';
import { Hero } from '@/components/marketing/hero';
import { Stats } from '@/components/marketing/stats';
import { Examples } from '@/components/marketing/examples';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { Features } from '@/components/marketing/features';
import { CopilotShowcase } from '@/components/marketing/copilot-showcase';
import { SectionLibrary, BrandKits } from '@/components/marketing/library';
import { Deploy } from '@/components/marketing/deploy';
import { Pricing } from '@/components/marketing/pricing';
import { Faq } from '@/components/marketing/faq';
import { FinalCta, MarketingFooter } from '@/components/marketing/closing';

/**
 * The public marketing site.
 *
 * Several sections render from the product's own registries - the section
 * library, the operation list, the brand kit presets - so the site describes
 * what the product actually does today rather than a copy deck that rots.
 */
export default async function HomePage() {
  const user = await currentUser();
  const ai = aiStatus();
  const signedIn = Boolean(user);

  // The brand-kit previews and the hero showcase render in the presets' real
  // typefaces, so the marketing page loads those families itself. The studio
  // chrome keeps using its own bundled font.
  const presetFonts = THEME_PRESETS.flatMap((preset) => {
    const theme = themeSchema.parse(preset.patch);
    return [theme.headingFont, theme.bodyFont];
  });
  const fontsHref = googleFontsHrefFor(presetFonts);

  return (
    // overflow-x-hidden guards against decorative glows and gradients ever
    // introducing horizontal scroll on narrow screens.
    <div className="min-h-screen overflow-x-hidden bg-white">
      {fontsHref ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={fontsHref} />
        </>
      ) : null}
      <MarketingNav signedIn={signedIn} />

      <main>
        <Hero providerLabel={ai.configured ? ai.label : null} signedIn={signedIn} />
        <Stats />
        <Examples />
        <HowItWorks />
        <Features />
        <CopilotShowcase />
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
