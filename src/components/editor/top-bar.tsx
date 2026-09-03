'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, ChevronLeft, CloudOff, ExternalLink, Loader2, Monitor, Redo2, Rocket, Smartphone, Tablet, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/brand';
import { DEVICE_WIDTH, useCanRedo, useCanUndo, useEditor, type Device } from './store';

const DEVICES: Array<{ id: Device; icon: typeof Monitor; label: string }> = [
  { id: 'desktop', icon: Monitor, label: 'Desktop' },
  { id: 'tablet', icon: Tablet, label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
];

export function TopBar({ productionUrl, onDeploy }: { productionUrl: string | null; onDeploy: () => void }) {
  const projectId = useEditor((state) => state.projectId);
  const projectName = useEditor((state) => state.projectName);
  const setProjectName = useEditor((state) => state.setProjectName);
  const device = useEditor((state) => state.device);
  const setDevice = useEditor((state) => state.setDevice);
  const saveState = useEditor((state) => state.saveState);
  const undo = useEditor((state) => state.undo);
  const redo = useEditor((state) => state.redo);
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const [editingName, setEditingName] = useState(false);

  async function commitName(name: string) {
    const trimmed = name.trim();
    setEditingName(false);
    if (!trimmed || trimmed === projectName) return;
    setProjectName(trimmed);
    await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    });
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-ink-200/70 bg-white px-3">
      <Link
        href="/dashboard"
        className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-800"
        aria-label="Back to dashboard"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink-900 text-[12px] font-black text-white">
        {BRAND.name.charAt(0)}
      </span>

      {editingName ? (
        <input
          autoFocus
          defaultValue={projectName}
          onBlur={(event) => void commitName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void commitName(event.currentTarget.value);
            if (event.key === 'Escape') setEditingName(false);
          }}
          className="focus-ring w-52 rounded-md border border-ink-200 px-2 py-1 text-[13px] font-semibold"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditingName(true)}
          title="Rename project"
          className="max-w-[220px] truncate rounded-md px-1.5 py-1 text-[13px] font-semibold text-ink-900 hover:bg-ink-100"
        >
          {projectName}
        </button>
      )}

      <SaveIndicator state={saveState} />

      <div className="mx-auto flex items-center gap-0.5 rounded-lg bg-ink-100 p-0.5">
        {DEVICES.map((option) => (
          <button
            key={option.id}
            type="button"
            title={`${option.label} · ${DEVICE_WIDTH[option.id]}px`}
            onClick={() => setDevice(option.id)}
            className={cn(
              'grid h-7 w-8 place-items-center rounded-md transition-colors',
              device === option.id ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800',
            )}
          >
            <option.icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={undo}>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" title="Redo (Ctrl+Shift+Z)" disabled={!canRedo} onClick={redo}>
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {productionUrl ? (
        <a
          href={productionUrl}
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-medium text-emerald-700 hover:bg-emerald-50 lg:flex"
        >
          Live <ExternalLink className="h-3 w-3" />
        </a>
      ) : null}

      <Button variant="secondary" size="sm" onClick={() => window.open(`/preview/${projectId}`, '_blank')}>
        Preview
      </Button>
      <Button variant="primary" size="sm" onClick={onDeploy}>
        <Rocket className="h-3.5 w-3.5" /> Deploy
      </Button>
    </header>
  );
}

function SaveIndicator({ state }: { state: 'saved' | 'dirty' | 'saving' | 'error' }) {
  if (state === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-ink-400">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-red-600">
        <CloudOff className="h-3 w-3" /> Not saved
      </span>
    );
  }
  if (state === 'dirty') return <span className="text-[11px] text-ink-400">Unsaved</span>;
  return (
    <span className="flex items-center gap-1 text-[11px] text-ink-400">
      <Check className="h-3 w-3" /> Saved
    </span>
  );
}
