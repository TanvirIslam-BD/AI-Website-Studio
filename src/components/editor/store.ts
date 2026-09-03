'use client';

import { create } from 'zustand';
import { applyOperation, OperationError, type OperationInput, type OperationName } from '@/lib/website/operations';
import { findSection, homePage, type WebsiteDocument } from '@/lib/website/document';
import { errorMessage } from '@/lib/utils';

/**
 * Editor state.
 *
 * The client runs the *same* operations layer as the server, so a click in the
 * inspector and a tool call from the copilot follow an identical code path and
 * are validated by identical zod schemas. Local edits apply instantly, push
 * onto an undo stack, and are autosaved as a whole document.
 */

export type Device = 'desktop' | 'tablet' | 'mobile';
export type LeftTab = 'pages' | 'sections' | 'assets' | 'theme';
export type SaveState = 'saved' | 'dirty' | 'saving' | 'error';

export const DEVICE_WIDTH: Record<Device, number> = { desktop: 1440, tablet: 834, mobile: 390 };

const HISTORY_LIMIT = 60;
const AUTOSAVE_DELAY = 900;

export type ChatEntry = {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  pending?: boolean;
  failed?: boolean;
};

type EditorState = {
  projectId: string;
  projectName: string;
  document: WebsiteDocument;

  past: WebsiteDocument[];
  future: WebsiteDocument[];

  activePageId: string;
  selectedSectionId: string | null;
  device: Device;
  leftTab: LeftTab;
  saveState: SaveState;
  lastError: string | null;
  copilotBusy: boolean;
  messages: ChatEntry[];

  init(input: { projectId: string; projectName: string; document: WebsiteDocument; messages: ChatEntry[] }): void;

  run<T extends OperationName>(name: T, input: OperationInput<T>): boolean;
  replaceDocument(document: WebsiteDocument, options?: { history?: boolean }): void;
  undo(): void;
  redo(): void;

  setActivePage(pageId: string): void;
  select(sectionId: string | null): void;
  setDevice(device: Device): void;
  setLeftTab(tab: LeftTab): void;
  setProjectName(name: string): void;
  clearError(): void;

  save(): void;
  setCopilotBusy(busy: boolean): void;
  setMessages(messages: ChatEntry[]): void;
  appendMessage(message: ChatEntry): void;
  patchMessage(id: string, patch: Partial<ChatEntry>): void;
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useEditor = create<EditorState>((set, get) => ({
  projectId: '',
  projectName: '',
  document: { theme: {} as WebsiteDocument['theme'], pages: [], assets: [] },
  past: [],
  future: [],
  activePageId: '',
  selectedSectionId: null,
  device: 'desktop',
  leftTab: 'sections',
  saveState: 'saved',
  lastError: null,
  copilotBusy: false,
  messages: [],

  init({ projectId, projectName, document, messages }) {
    set({
      projectId,
      projectName,
      document,
      messages,
      past: [],
      future: [],
      activePageId: homePage(document).id,
      selectedSectionId: null,
      saveState: 'saved',
      lastError: null,
    });
  },

  run(name, input) {
    const { document } = get();
    try {
      const result = applyOperation(document, name, input);
      set((state) => ({
        document: result.document,
        past: [...state.past, document].slice(-HISTORY_LIMIT),
        future: [],
        saveState: 'dirty',
        lastError: null,
      }));
      get().save();
      return true;
    } catch (error) {
      set({ lastError: error instanceof OperationError ? error.message : errorMessage(error) });
      return false;
    }
  },

  replaceDocument(document, options) {
    const previous = get().document;
    set((state) => ({
      document,
      past: options?.history === false ? state.past : [...state.past, previous].slice(-HISTORY_LIMIT),
      future: [],
      saveState: options?.history === false ? state.saveState : 'saved',
      selectedSectionId:
        state.selectedSectionId && findSection(document, state.selectedSectionId) ? state.selectedSectionId : null,
      activePageId: document.pages.some((page) => page.id === state.activePageId)
        ? state.activePageId
        : homePage(document).id,
    }));
  },

  undo() {
    const { past, document, future } = get();
    const previous = past[past.length - 1];
    if (!previous) return;
    set({
      document: previous,
      past: past.slice(0, -1),
      future: [document, ...future].slice(0, HISTORY_LIMIT),
      saveState: 'dirty',
    });
    get().save();
  },

  redo() {
    const { future, document, past } = get();
    const next = future[0];
    if (!next) return;
    set({
      document: next,
      future: future.slice(1),
      past: [...past, document].slice(-HISTORY_LIMIT),
      saveState: 'dirty',
    });
    get().save();
  },

  setActivePage(activePageId) {
    set({ activePageId, selectedSectionId: null });
  },
  select(selectedSectionId) {
    set({ selectedSectionId });
  },
  setDevice(device) {
    set({ device });
  },
  setLeftTab(leftTab) {
    set({ leftTab });
  },
  setProjectName(projectName) {
    set({ projectName });
  },
  clearError() {
    set({ lastError: null });
  },

  save() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      void persist(set, get);
    }, AUTOSAVE_DELAY);
  },

  setCopilotBusy(copilotBusy) {
    set({ copilotBusy });
  },
  setMessages(messages) {
    set({ messages });
  },
  appendMessage(message) {
    set((state) => ({ messages: [...state.messages, message] }));
  },
  patchMessage(id, patch) {
    set((state) => ({ messages: state.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
  },
}));

type Setter = (partial: Partial<EditorState> | ((state: EditorState) => Partial<EditorState>)) => void;

async function persist(set: Setter, get: () => EditorState) {
  const { projectId, document } = get();
  if (!projectId) return;

  set({ saveState: 'saving' });
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? 'Could not save your changes.');
    }
    // A newer edit may have landed while this request was in flight.
    set((state) => ({ saveState: state.document === document ? 'saved' : 'dirty' }));
  } catch (error) {
    set({ saveState: 'error', lastError: errorMessage(error, 'Could not save your changes.') });
  }
}

// --- selectors -------------------------------------------------------------

export function useActivePage() {
  return useEditor(
    (state) => state.document.pages.find((page) => page.id === state.activePageId) ?? state.document.pages[0],
  );
}

export function useSelectedSection() {
  return useEditor((state) =>
    state.selectedSectionId ? findSection(state.document, state.selectedSectionId)?.section ?? null : null,
  );
}

export function useCanUndo() {
  return useEditor((state) => state.past.length > 0);
}

export function useCanRedo() {
  return useEditor((state) => state.future.length > 0);
}
