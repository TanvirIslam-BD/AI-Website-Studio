import { z } from 'zod';
import { createSection } from '@/lib/website/blueprints';
import { normalizeDocument, pageSchema, type WebsiteDocument } from '@/lib/website/document';
import { isSectionType, type Section } from '@/lib/website/sections';
import { stockImages } from '@/lib/website/stock';
import { themeSchema, THEME_PRESETS } from '@/lib/website/theme';
import { createId, slugify } from '@/lib/ids';
import { getProvider } from './index';
import { extractJsonObject } from './json';
import { generationUserMessage, websiteGenerationPrompt } from './prompts';
import { generateFromTemplate } from './template';
import { detectTopic, guessBrand, normalizeTopic } from './topics';

/**
 * Prompt -> structured website.
 *
 * The model returns data only. Every section is then rebuilt through
 * `createSection`, which merges the model's props over a valid blueprint and
 * runs the zod schema. The result: unknown keys are dropped, missing props get
 * good defaults, and a partially malformed response still yields a usable site
 * instead of an error.
 */

export type GenerationResult = {
  document: WebsiteDocument;
  brand: string;
  description: string;
  source: 'ai' | 'template';
  /** Populated when the AI path was attempted but could not be used. */
  warning?: string;
};

/** Intentionally permissive - the section schemas do the real validation. */
const responseSchema = z.object({
  brand: z.string().max(80).optional(),
  topic: z.string().max(40).optional(),
  description: z.string().max(400).optional(),
  theme: z.record(z.unknown()).optional(),
  pages: z
    .array(
      z.object({
        name: z.string().max(80),
        slug: z.string().max(80).optional(),
        seoTitle: z.string().max(140).optional(),
        seoDesc: z.string().max(400).optional(),
        sections: z.array(z.record(z.unknown())).max(30),
      }),
    )
    .min(1)
    .max(8),
});

export async function generateWebsite(brief: string): Promise<GenerationResult> {
  const provider = getProvider();
  if (!provider) {
    const template = generateFromTemplate(brief);
    return { document: template.document, brand: template.brand, description: template.description, source: 'template' };
  }

  try {
    const topicGuess = detectTopic(brief);
    const stock = stockImages(topicGuess, 6);

    const response = await provider.complete({
      system: websiteGenerationPrompt(),
      messages: [{ role: 'user', content: generationUserMessage(brief, stock) }],
      maxTokens: 16000,
      temperature: 0.7,
      json: true,
    });

    return buildFromResponse(response.text, brief, stock);
  } catch (error) {
    // Never leave the user without a website: fall back to the template path
    // and tell them why the AI result was not used.
    const template = generateFromTemplate(brief);
    return {
      document: template.document,
      brand: template.brand,
      description: template.description,
      source: 'template',
      warning: error instanceof Error ? error.message : 'AI generation failed',
    };
  }
}

/** Exported for tests: converts raw model text into a validated document. */
export function buildFromResponse(text: string, brief: string, stock: string[]): GenerationResult {
  const parsed = responseSchema.safeParse(extractJsonObject(text));
  if (!parsed.success) {
    throw new Error(`Model response did not match the expected shape: ${parsed.error.issues[0]?.message ?? 'unknown'}`);
  }

  const data = parsed.data;
  const topic = normalizeTopic(data.topic, detectTopic(brief));
  const brand = (data.brand ?? '').trim() || guessBrand(brief) || 'Studio';
  const context = { brand, topic };

  const themeCandidate = themeSchema.safeParse({ ...THEME_PRESETS[0].patch, ...(data.theme ?? {}) });
  const theme = themeCandidate.success ? themeCandidate.data : themeSchema.parse(THEME_PRESETS[0].patch);

  const pages = data.pages.map((page, pageIndex) => {
    const sections: Section[] = [];
    for (const raw of page.sections) {
      const type = raw.type;
      if (!isSectionType(type)) continue;
      // Blueprint defaults underneath, model props on top, schema over both.
      sections.push(createSection(type, raw, context));
    }

    const isHome = pageIndex === 0;
    return pageSchema.parse({
      id: createId('pg'),
      name: page.name || (isHome ? 'Home' : `Page ${pageIndex + 1}`),
      slug: isHome ? '' : slugify(page.slug || page.name, `page-${pageIndex + 1}`),
      isHome,
      seoTitle: page.seoTitle ?? null,
      seoDesc: page.seoDesc ?? null,
      sections,
    });
  });

  const usable = pages.filter((page) => page.sections.length > 0);
  if (usable.length === 0) {
    throw new Error('The model returned no usable sections.');
  }

  const urls = new Set<string>(stock);
  for (const page of usable) {
    for (const section of page.sections) {
      collectImageUrls(section, urls);
    }
  }

  const document = normalizeDocument({
    theme,
    pages: usable,
    assets: Array.from(urls).map((url) => ({ id: createId('ast'), url, alt: '', provider: 'stock' as const, meta: null })),
  });

  return {
    document,
    brand,
    description: (data.description ?? '').trim() || `A website for ${brand}.`,
    source: 'ai',
  };
}

function collectImageUrls(value: unknown, into: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) collectImageUrls(item, into);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key === 'url' && typeof child === 'string' && child.startsWith('https://')) into.add(child);
      else collectImageUrls(child, into);
    }
  }
}
