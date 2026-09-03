'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, FileText, Image as ImageIcon, Layers, Palette, X } from 'lucide-react';
import type { WebsiteDocument } from '@/lib/website/document';
import { parseIncomingDocument } from '@/lib/website/document';
import { createId } from '@/lib/ids';
import { cn, errorMessage } from '@/lib/utils';
import { Canvas } from './canvas';
import { Copilot } from './copilot';
import { DeployPanel } from './deploy-panel';
import { Inspector } from './inspector';
import { TopBar } from './top-bar';
import { AssetsPanel } from './panels/assets';
import { PagesPanel } from './panels/pages';
import { SectionsPanel } from './panels/sections';
import { ThemePanel } from './panels/theme';
import { useEditor, useSelectedSection, type ChatEntry, type LeftTab } from './store';

const TABS: Array<{ id: LeftTab; label: string; icon: typeof Layers }> = [
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'sections', label: 'Sections', icon: Layers },
  { id: 'assets', label: 'Assets', icon: ImageIcon },
  { id: 'theme', label: 'Theme', icon: Palette },
];

type Pane = 'design' | 'canvas' | 'copilot';

const PANES: Array<{ id: Pane; label: string }> = [
  { id: 'design', label: 'Design' },
  { id: 'canvas', label: 'Website' },
  { id: 'copilot', label: 'Copilot' },
];

/**
 * Pane switcher, shown only below the lg breakpoint where three columns do not
 * fit. On wide screens all three panes are visible and this is hidden.
 */
function PaneTabs({ pane, setPane }: { pane: Pane; setPane: (pane: Pane) => void }) {
  return (
    <div className="flex shrink-0 gap-1 border-b border-ink-200/70 bg-ink-50/60 px-2 py-1.5 lg:hidden">
      {PANES.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setPane(option.id)}
          className={cn(
            'flex-1 rounded-md py-1.5 text-[12px] font-semibold transition-colors',
            pane === option.id ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export type EditorBootstrap = {
  projectId: string;
  projectName: string;
  productionUrl: string | null;
  document: WebsiteDocument;
  messages: ChatEntry[];
};

/**
 * Editor shell: three columns, per the product layout.
 *
 *   Pages / Sections / Assets / Theme | Website canvas | AI Copilot
 *
 * The left column swaps to the section inspector when something is selected,
 * which keeps the layout stable while giving property editing real space.
 */
export function EditorShell({ bootstrap }: { bootstrap: EditorBootstrap }) {
  const init = useEditor((state) => state.init);
  const leftTab = useEditor((state) => state.leftTab);
  const setLeftTab = useEditor((state) => state.setLeftTab);
  const lastError = useEditor((state) => state.lastError);
  const clearError = useEditor((state) => state.clearError);
  const undo = useEditor((state) => state.undo);
  const redo = useEditor((state) => state.redo);
  const selected = useSelectedSection();

  const [deployOpen, setDeployOpen] = useState(false);
  const [pane, setPane] = useState<Pane>('canvas');

  useEffect(() => {
    init({
      projectId: bootstrap.projectId,
      projectName: bootstrap.projectName,
      document: bootstrap.document,
      messages: bootstrap.messages,
    });
  }, [bootstrap, init]);

  // On narrow screens the inspector lives in the hidden "Design" pane, so
  // selecting a section on the canvas has to bring that pane forward.
  useEffect(() => {
    if (selected && window.innerWidth < 1024) setPane('design');
  }, [selected?.id]);

  // Keyboard shortcuts. Ignored while typing in a field.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (!(event.metaKey || event.ctrlKey)) return;

      if (event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      if (event.key.toLowerCase() === 's') {
        event.preventDefault(); // Autosave already handles persistence.
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const send = useCopilot();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <TopBar productionUrl={bootstrap.productionUrl} onDeploy={() => setDeployOpen(true)} />

      <PaneTabs pane={pane} setPane={setPane} />

      <div
        className={cn(
          'grid min-h-0 flex-1',
          // Below lg the three panes do not fit side by side, so one is shown
          // at a time and switched from the tab strip above.
          'grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_296px] xl:grid-cols-[268px_minmax(0,1fr)_320px]',
        )}
      >
        <aside
          className={cn(
            'flex min-h-0 min-w-0 flex-col border-r border-ink-200/70 bg-white',
            pane === 'design' ? 'flex' : 'hidden lg:flex',
          )}
        >
          {selected ? (
            <Inspector section={selected} onAskAi={(instruction) => void send(instruction)} />
          ) : (
            <>
              <nav className="flex shrink-0 border-b border-ink-200/70">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLeftTab(tab.id)}
                    className={cn(
                      'flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-semibold uppercase tracking-wide transition-colors',
                      leftTab === tab.id
                        ? 'border-b-2 border-ink-900 text-ink-900'
                        : 'border-b-2 border-transparent text-ink-400 hover:text-ink-700',
                    )}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
              <div className="min-h-0 flex-1">
                {leftTab === 'pages' ? <PagesPanel /> : null}
                {leftTab === 'sections' ? <SectionsPanel /> : null}
                {leftTab === 'assets' ? <AssetsPanel /> : null}
                {leftTab === 'theme' ? <ThemePanel onAskAi={(instruction) => void send(instruction)} /> : null}
              </div>
            </>
          )}
        </aside>

        {/* min-w-0 is essential: without it this grid item can outgrow its
            track, which stops the canvas from measuring and scaling itself. */}
        <main className={cn('min-h-0 min-w-0', pane === 'canvas' ? 'block' : 'hidden lg:block')}>
          <Canvas />
        </main>

        <aside
          className={cn(
            'min-h-0 min-w-0 flex-col border-l border-ink-200/70 bg-white',
            pane === 'copilot' ? 'flex' : 'hidden lg:flex',
          )}
        >
          <Copilot send={send} />
        </aside>
      </div>

      {lastError ? (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
          <div className="pointer-events-auto flex max-w-md items-start gap-2.5 rounded-xl bg-ink-900 px-3.5 py-2.5 text-[13px] text-white shadow-pop">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-300" />
            <span className="leading-relaxed">{lastError}</span>
            <button type="button" onClick={clearError} aria-label="Dismiss" className="ml-1 shrink-0 opacity-60 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      {deployOpen ? <DeployPanel projectId={bootstrap.projectId} onClose={() => setDeployOpen(false)} /> : null}
    </div>
  );
}

/**
 * Copilot transport.
 *
 * Optimistically shows the user's message, sends the live document plus the
 * current selection, then swaps in the document the server returns as one
 * undoable step.
 */
function useCopilot() {
  const appendMessage = useEditor((state) => state.appendMessage);
  const patchMessage = useEditor((state) => state.patchMessage);
  const setCopilotBusy = useEditor((state) => state.setCopilotBusy);
  const replaceDocument = useEditor((state) => state.replaceDocument);

  return useCallback(
    async (instruction: string) => {
      const state = useEditor.getState();
      if (state.copilotBusy) return;

      const pendingId = createId('msg');
      appendMessage({ id: createId('msg'), role: 'USER', content: instruction });
      appendMessage({ id: pendingId, role: 'ASSISTANT', content: '', pending: true });
      setCopilotBusy(true);

      try {
        const response = await fetch(`/api/projects/${state.projectId}/copilot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instruction,
            document: state.document,
            selectedSectionId: state.selectedSectionId ?? undefined,
            activePageId: state.activePageId,
          }),
        });

        const payload = (await response.json()) as {
          message?: string;
          document?: unknown;
          changed?: boolean;
          error?: string;
        };
        if (!response.ok) throw new Error(payload.error ?? 'The copilot could not complete that.');

        if (payload.changed && payload.document) {
          replaceDocument(parseIncomingDocument(payload.document));
        }
        patchMessage(pendingId, { content: payload.message ?? 'Done.', pending: false });
      } catch (caught) {
        patchMessage(pendingId, { content: errorMessage(caught), pending: false, failed: true });
      } finally {
        setCopilotBusy(false);
      }
    },
    [appendMessage, patchMessage, replaceDocument, setCopilotBusy],
  );
}
