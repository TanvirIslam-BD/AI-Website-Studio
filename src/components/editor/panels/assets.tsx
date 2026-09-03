'use client';

import { useEffect, useState } from 'react';
import { ImagePlus, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { errorMessage } from '@/lib/utils';
import { useEditor, useSelectedSection } from '../store';

type ImageResult = { url: string; thumbUrl: string; alt: string; credit?: { name: string; url: string } | null };

/** Paths that accept an image, per section type. */
function imageTargets(section: Record<string, unknown> | null): Array<{ path: string; label: string }> {
  if (!section) return [];
  const targets: Array<{ path: string; label: string }> = [];
  if ('image' in section) targets.push({ path: 'image', label: 'Main image' });
  if ('logoImage' in section) targets.push({ path: 'logoImage', label: 'Logo' });
  if (Array.isArray(section.images)) {
    section.images.forEach((_, index) => targets.push({ path: `images.${index}`, label: `Gallery image ${index + 1}` }));
  }
  if (Array.isArray(section.items)) {
    section.items.forEach((item, index) => {
      if (item && typeof item === 'object' && ('image' in item || 'avatar' in item)) {
        const key = 'image' in (item as object) ? 'image' : 'avatar';
        targets.push({ path: `items.${index}.${key}`, label: `Item ${index + 1} image` });
      }
    });
  }
  return targets;
}

/**
 * Asset library.
 *
 * Search results come from whichever provider is configured (Unsplash if a key
 * is present, otherwise the built-in collection). Applying an image goes
 * through `set_section_image`, which validates the URL and files it in the
 * project's asset list.
 */
export function AssetsPanel() {
  const assets = useEditor((state) => state.document.assets);
  const run = useEditor((state) => state.run);
  const selected = useSelectedSection();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ImageResult[]>([]);
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targets = imageTargets(selected as unknown as Record<string, unknown> | null);
  const [target, setTarget] = useState(targets[0]?.path ?? 'image');

  useEffect(() => {
    setTarget(targets[0]?.path ?? 'image');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, targets.length]);

  async function search(term: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/assets?q=${encodeURIComponent(term)}&count=18`);
      const payload = (await response.json()) as { results?: ImageResult[]; provider?: string; error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Image search failed.');
      setResults(payload.results ?? []);
      setProvider(payload.provider ?? '');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void search('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function apply(url: string) {
    if (!selected) {
      run('add_asset', { url, provider: 'stock' });
      return;
    }
    run('set_section_image', { sectionId: selected.id, path: target, url });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-200/70 p-2.5">
        <form
          className="flex gap-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            void search(query);
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="restaurant, portrait, workspace"
              className="pl-8 text-[13px]"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" loading={loading}>
            Go
          </Button>
        </form>

        {selected ? (
          targets.length > 0 ? (
            <label className="mt-2 block">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Apply to</span>
              <select
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                className="focus-ring mt-1 w-full rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-[12px]"
              >
                {targets.map((option) => (
                  <option key={option.path} value={option.path}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="mt-2 text-[11px] text-ink-400">
              The selected {selected.type} section has no image slot. Clicking an image adds it to the library.
            </p>
          )
        ) : (
          <p className="mt-2 text-[11px] text-ink-400">Select a section first to place an image directly.</p>
        )}
      </div>

      <div className="studio-scroll flex-1 overflow-y-auto p-2.5">
        {error ? <p className="mb-2 rounded-lg bg-red-50 px-2.5 py-2 text-[12px] text-red-700">{error}</p> : null}

        {assets.length > 0 ? (
          <>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-400">
              In this project ({assets.length})
            </p>
            <Grid images={assets.map((asset) => ({ url: asset.url, thumbUrl: asset.url, alt: asset.alt }))} onPick={apply} />
            <p className="mb-1.5 mt-4 text-[10px] font-bold uppercase tracking-wide text-ink-400">{provider || 'Library'}</p>
          </>
        ) : null}

        {loading && results.length === 0 ? (
          <div className="grid place-items-center py-10 text-ink-400">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <Grid images={results} onPick={apply} />
        )}
      </div>
    </div>
  );
}

function Grid({ images, onPick }: { images: ImageResult[]; onPick: (url: string) => void }) {
  if (images.length === 0) {
    return (
      <p className="flex items-center gap-1.5 rounded-lg border border-dashed border-ink-200 px-2.5 py-3 text-[12px] text-ink-400">
        <ImagePlus className="h-3.5 w-3.5" /> No images yet.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {images.map((image, index) => (
        <button
          key={`${image.url}-${index}`}
          type="button"
          onClick={() => onPick(image.url)}
          title={image.credit ? `Photo by ${image.credit.name}` : image.alt}
          className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-ink-200 focus-ring"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.thumbUrl}
            alt={image.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.05]"
          />
        </button>
      ))}
    </div>
  );
}
