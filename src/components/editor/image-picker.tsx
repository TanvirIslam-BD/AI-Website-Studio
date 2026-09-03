'use client';

import { useEffect, useState } from 'react';
import { ImagePlus, Loader2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { errorMessage } from '@/lib/utils';
import { useEditor } from './store';

type ImageResult = { url: string; thumbUrl: string; alt: string; credit?: { name: string; url: string } | null };

/**
 * Image picker over the asset providers.
 *
 * Shows the project's own asset library first, then provider search results.
 * Whatever is chosen is written into the section through `set_section_image`,
 * which also files the URL in the project library.
 */
export function ImagePicker({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const assets = useEditor((state) => state.document.assets);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ImageResult[]>([]);
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [custom, setCustom] = useState('');

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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/40 p-4" role="dialog" aria-modal>
      <div className="flex max-h-[82vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-pop">
        <div className="flex items-center gap-3 border-b border-ink-200/70 px-4 py-3">
          <ImagePlus className="h-4 w-4 text-ink-400" />
          <h2 className="text-sm font-semibold text-ink-900">Choose an image</h2>
          <span className="text-[11px] text-ink-400">{provider}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-ink-200/70 p-4">
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void search(query);
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search photos: restaurant interior, portrait, workspace..."
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary" loading={loading}>
              Search
            </Button>
          </form>

          <div className="mt-2 flex gap-2">
            <Input
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
              placeholder="...or paste an image URL"
              className="text-[13px]"
            />
            <Button
              variant="ghost"
              disabled={!/^https?:\/\//i.test(custom.trim())}
              onClick={() => {
                onPick(custom.trim());
                onClose();
              }}
            >
              Use URL
            </Button>
          </div>
        </div>

        <div className="studio-scroll flex-1 overflow-y-auto p-4">
          {error ? <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p> : null}

          {assets.length > 0 ? (
            <>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">In this project</p>
              <Grid
                images={assets.slice(0, 12).map((asset) => ({ url: asset.url, thumbUrl: asset.url, alt: asset.alt }))}
                onPick={(url) => {
                  onPick(url);
                  onClose();
                }}
              />
              <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">Library</p>
            </>
          ) : null}

          {loading && results.length === 0 ? (
            <div className="grid place-items-center py-12 text-ink-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <Grid
              images={results}
              onPick={(url) => {
                onPick(url);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Grid({ images, onPick }: { images: ImageResult[]; onPick: (url: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {images.map((image, index) => (
        <button
          key={`${image.url}-${index}`}
          type="button"
          onClick={() => onPick(image.url)}
          className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-ink-200 focus-ring"
          title={image.credit ? `Photo by ${image.credit.name}` : image.alt}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.thumbUrl}
            alt={image.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
          />
        </button>
      ))}
    </div>
  );
}
