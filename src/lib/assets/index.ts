import { STOCK, TOPIC_KEYS, stockImages, type StockTopic } from '@/lib/website/stock';
import { detectTopic } from '@/lib/ai/topics';

/**
 * The asset system.
 *
 * Providers implement one interface, so the library can grow (Unsplash today,
 * AI image generation and direct uploads next) without touching the editor or
 * the section schemas. Whatever a provider returns is written into the project
 * Asset table by the operations layer, never referenced live.
 */

export type ImageResult = {
  url: string;
  thumbUrl: string;
  alt: string;
  width?: number;
  height?: number;
  provider: 'stock' | 'unsplash' | 'ai' | 'url';
  credit?: { name: string; url: string } | null;
};

export interface ImageProvider {
  readonly id: ImageResult['provider'];
  readonly label: string;
  readonly available: boolean;
  search(query: string, count: number): Promise<ImageResult[]>;
}

/** Always available: the curated collection that ships with the product. */
export const stockProvider: ImageProvider = {
  id: 'stock',
  label: 'Built-in library',
  available: true,
  async search(query, count) {
    const topic: StockTopic = query.trim()
      ? TOPIC_KEYS.find((key) => key === query.trim().toLowerCase()) ?? detectTopic(query)
      : 'abstract';

    const primary = stockImages(topic, Math.min(count, STOCK[topic].length));
    // Top up from neighbouring topics so a search always fills the grid.
    const extras = TOPIC_KEYS.filter((key) => key !== topic).flatMap((key) => stockImages(key, 2));

    return [...primary, ...extras].slice(0, count).map((url) => ({
      url,
      thumbUrl: url.replace('w=1600', 'w=400'),
      alt: `${topic} photograph`,
      provider: 'stock' as const,
      credit: null,
    }));
  },
};

type UnsplashPhoto = {
  urls: { raw: string; regular: string; small: string };
  alt_description: string | null;
  width: number;
  height: number;
  user: { name: string; links: { html: string } };
};

export const unsplashProvider: ImageProvider = {
  id: 'unsplash',
  label: 'Unsplash',
  get available() {
    return Boolean(process.env.UNSPLASH_ACCESS_KEY?.trim());
  },
  async search(query, count) {
    const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
    if (!key) return [];

    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.set('query', query || 'business');
    url.searchParams.set('per_page', String(Math.min(count, 30)));
    url.searchParams.set('orientation', 'landscape');
    url.searchParams.set('content_filter', 'high');

    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${key}` },
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error(`Unsplash responded ${response.status}`);

    const data = (await response.json()) as { results: UnsplashPhoto[] };
    return data.results.map((photo) => ({
      url: `${photo.urls.raw}&auto=format&fit=crop&w=1600&q=80`,
      thumbUrl: photo.urls.small,
      alt: photo.alt_description ?? query,
      width: photo.width,
      height: photo.height,
      provider: 'unsplash' as const,
      credit: { name: photo.user.name, url: photo.user.links.html },
    }));
  },
};

const PROVIDERS: ImageProvider[] = [unsplashProvider, stockProvider];

export function availableProviders(): ImageProvider[] {
  return PROVIDERS.filter((provider) => provider.available);
}

/**
 * Searches the best available provider, falling back to the built-in library
 * if a remote provider is unreachable. Image search should never be able to
 * break the editor.
 */
export async function searchImages(query: string, count = 12): Promise<{ results: ImageResult[]; provider: string }> {
  for (const provider of availableProviders()) {
    try {
      const results = await provider.search(query, count);
      if (results.length > 0) return { results, provider: provider.label };
    } catch (error) {
      console.warn(`[assets] ${provider.id} search failed:`, error instanceof Error ? error.message : error);
    }
  }
  return { results: await stockProvider.search(query, count), provider: stockProvider.label };
}
