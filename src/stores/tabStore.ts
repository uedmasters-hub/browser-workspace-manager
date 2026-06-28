import { create } from "zustand";

import { getTabs } from "../browser/services/tabService";

import {
  closeTabs,
  pinTabs,
  duplicateTabs,
  moveTabs,
  activateTab as activateChromeTab,
} from "../browser/services/tabActionService";

import {
  getFavoriteTabUrls,
  toggleFavoriteTab,
} from "../browser/storage/favoriteTabsRepository";

import { useWindowStore } from "./windowStore";

import type { WorkspaceTab } from "../types/tab";

interface TabState {
  tabs: WorkspaceTab[];

  currentWindowId?: number;

  favoriteUrls: string[];

  selectionMode: boolean;

  selectedTabs: number[];
}

interface TabActions {
  loadTabs: (
    chromeWindowId: number
  ) => Promise<void>;

  reloadTabs: () => Promise<void>;

  /** Switch to a tab: activate it and focus its window. */
  activateTab: (
    tabId: number
  ) => Promise<void>;

  /** Star/unstar a tab for quick navigation (persisted by URL). */
  toggleTabFavorite: (
    tabId: number
  ) => Promise<void>;

  toggleSelectionMode: () => void;

  toggleTabSelection: (
    tabId: number
  ) => void;

  clearSelection: () => void;

  selectAllTabs: () => void;

  closeSelectedTabs: () => Promise<void>;

  pinSelectedTabs: () => Promise<void>;

  duplicateSelectedTabs: () => Promise<void>;

  moveSelectedTabs: (
    targetWindowId: number
  ) => Promise<void>;
}

type TabStore = TabState & TabActions;

/** Mark which tabs are favorites based on the saved URL list. */
function annotate(
  tabs: WorkspaceTab[],
  favoriteUrls: string[]
): WorkspaceTab[] {
  const set = new Set(favoriteUrls);

  return tabs.map((tab) => ({
    ...tab,
    favorite: set.has(tab.url),
  }));
}

/**
 * Reloads the tabs for the window currently in view and keeps the
 * window list (tab counts) in sync after any mutation.
 */
async function syncAfterMutation(
  get: () => TabStore,
  set: (partial: Partial<TabState>) => void
) {
  const windowId = get().currentWindowId;

  if (windowId !== undefined) {
    const tabs = await getTabs(windowId);
    set({ tabs: annotate(tabs, get().favoriteUrls) });
  }

  await useWindowStore.getState().refreshWindows();
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],

  currentWindowId: undefined,

  favoriteUrls: [],

  selectionMode: false,

  selectedTabs: [],

  loadTabs: async (chromeWindowId) => {
    const [tabs, favoriteUrls] = await Promise.all([
      getTabs(chromeWindowId),
      getFavoriteTabUrls(),
    ]);

    set({
      tabs: annotate(tabs, favoriteUrls),
      favoriteUrls,
      currentWindowId: chromeWindowId,
      selectedTabs: [],
    });
  },

  reloadTabs: async () => {
    const windowId = get().currentWindowId;

    if (windowId === undefined) {
      return;
    }

    const tabs = await getTabs(windowId);

    set({ tabs: annotate(tabs, get().favoriteUrls) });
  },

  activateTab: async (tabId) => {
    const tab = get().tabs.find((item) => item.id === tabId);

    if (!tab) {
      console.warn("[activateTab] no tab in store for id", tabId);
      return;
    }

    try {
      await activateChromeTab(tabId, tab.windowId);

      // Switching focuses the target window; close the popup so the tab is
      // front and center.
      if (typeof window !== "undefined") {
        window.close();
      }
    } catch (error) {
      console.error("[activateTab] failed to switch to tab", tabId, error);
    }
  },

  toggleTabFavorite: async (tabId) => {
    const tab = get().tabs.find((item) => item.id === tabId);

    if (!tab || !tab.url) {
      return;
    }

    const favoriteUrls = await toggleFavoriteTab(tab.url);

    set({
      favoriteUrls,
      tabs: annotate(get().tabs, favoriteUrls),
    });
  },

  toggleSelectionMode: () =>
    set((state) => ({
      selectionMode: !state.selectionMode,
      selectedTabs: [],
    })),

  toggleTabSelection: (tabId) =>
    set((state) => ({
      selectedTabs: state.selectedTabs.includes(tabId)
        ? state.selectedTabs.filter((id) => id !== tabId)
        : [...state.selectedTabs, tabId],
    })),

  clearSelection: () => set({ selectedTabs: [] }),

  selectAllTabs: () =>
    set((state) => ({
      selectedTabs: state.tabs.map((tab) => tab.id),
    })),

  closeSelectedTabs: async () => {
    const { selectedTabs } = get();

    if (selectedTabs.length === 0) {
      return;
    }

    await closeTabs(selectedTabs);

    set({ selectedTabs: [], selectionMode: false });

    await syncAfterMutation(get, set);
  },

  pinSelectedTabs: async () => {
    const { selectedTabs, tabs } = get();

    if (selectedTabs.length === 0) {
      return;
    }

    const allPinned = selectedTabs.every(
      (id) => tabs.find((tab) => tab.id === id)?.pinned
    );

    await pinTabs(selectedTabs, !allPinned);

    await syncAfterMutation(get, set);
  },

  duplicateSelectedTabs: async () => {
    const { selectedTabs } = get();

    if (selectedTabs.length === 0) {
      return;
    }

    await duplicateTabs(selectedTabs);

    await syncAfterMutation(get, set);
  },

  moveSelectedTabs: async (targetWindowId) => {
    const { selectedTabs } = get();

    if (selectedTabs.length === 0) {
      return;
    }

    await moveTabs(selectedTabs, targetWindowId);

    set({ selectedTabs: [], selectionMode: false });

    await syncAfterMutation(get, set);
  },
}));
