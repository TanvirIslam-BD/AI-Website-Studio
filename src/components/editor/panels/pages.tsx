'use client';

import { useState } from 'react';
import { FileText, Home, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { useEditor } from '../store';

const PRESETS = [
  { name: 'About', sections: ['hero', 'textMedia', 'team', 'cta'] },
  { name: 'Services', sections: ['hero', 'features', 'pricing', 'faq', 'cta'] },
  { name: 'Contact', sections: ['contact', 'faq'] },
  { name: 'Blank page', sections: ['hero', 'cta'] },
] as const;

export function PagesPanel() {
  const pages = useEditor((state) => state.document.pages);
  const activePageId = useEditor((state) => state.activePageId);
  const setActivePage = useEditor((state) => state.setActivePage);
  const run = useEditor((state) => state.run);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  const active = pages.find((page) => page.id === activePageId);

  return (
    <div className="flex h-full flex-col">
      <div className="studio-scroll flex-1 overflow-y-auto p-2">
        <ul className="grid gap-0.5">
          {pages.map((page) => (
            <li key={page.id}>
              <div
                className={cn(
                  'group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
                  page.id === activePageId ? 'bg-brand-50 text-brand-800' : 'text-ink-700 hover:bg-ink-100',
                )}
              >
                <button
                  type="button"
                  onClick={() => setActivePage(page.id)}
                  onDoubleClick={() => setEditing(page.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  {page.isHome ? <Home className="h-3.5 w-3.5 shrink-0" /> : <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{page.name}</span>
                    <span className="block truncate font-mono text-[10px] opacity-50">/{page.slug}</span>
                  </span>
                  <span className="shrink-0 text-[10px] opacity-50">{page.sections.length}</span>
                </button>
                {!page.isHome ? (
                  <button
                    type="button"
                    aria-label={`Delete ${page.name}`}
                    onClick={() => {
                      if (window.confirm(`Delete the "${page.name}" page and its sections?`)) {
                        run('delete_page', { page: page.id });
                      }
                    }}
                    className="grid h-6 w-6 shrink-0 place-items-center rounded text-ink-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                ) : null}
              </div>

              {editing === page.id ? (
                <form
                  className="mt-1 grid gap-1.5 rounded-lg border border-ink-200 bg-white p-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    run('update_page', {
                      page: page.id,
                      name: String(formData.get('name') ?? page.name),
                      slug: page.isHome ? undefined : String(formData.get('slug') ?? page.slug),
                      seoTitle: String(formData.get('seoTitle') ?? '') || undefined,
                      seoDesc: String(formData.get('seoDesc') ?? '') || undefined,
                    });
                    setEditing(null);
                  }}
                >
                  <Input name="name" defaultValue={page.name} placeholder="Page name" className="text-[13px]" />
                  {!page.isHome ? (
                    <Input name="slug" defaultValue={page.slug} placeholder="url-path" className="font-mono text-[12px]" />
                  ) : null}
                  <Input name="seoTitle" defaultValue={page.seoTitle ?? ''} placeholder="SEO title" className="text-[12px]" />
                  <Input name="seoDesc" defaultValue={page.seoDesc ?? ''} placeholder="SEO description" className="text-[12px]" />
                  <div className="flex gap-1.5">
                    <Button type="submit" variant="primary" size="sm">
                      Save
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : null}
            </li>
          ))}
        </ul>

        {adding ? (
          <div className="mt-2 grid gap-2 rounded-lg border border-ink-200 bg-white p-2">
            <Input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Page name"
              className="text-[13px]"
            />
            <div className="grid gap-1">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    const created = run('create_page', {
                      name: name.trim() || preset.name,
                      sections: [...preset.sections],
                    });
                    if (created) {
                      setAdding(false);
                      setName('');
                    }
                  }}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-left text-[12px] text-ink-700 hover:bg-ink-100"
                >
                  <span className="font-medium">{preset.name}</span>
                  <span className="text-[10px] text-ink-400">{preset.sections.length} sections</span>
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        ) : null}
      </div>

      <div className="border-t border-ink-200/70 p-2">
        <Button variant="secondary" size="sm" className="w-full justify-center" onClick={() => setAdding((value) => !value)}>
          <Plus className="h-3.5 w-3.5" /> New page
        </Button>
        {active ? (
          <p className="mt-2 flex items-center gap-1.5 px-1 text-[11px] text-ink-400">
            <Search className="h-3 w-3" /> Double-click a page to edit its SEO
          </p>
        ) : null}
      </div>
    </div>
  );
}
