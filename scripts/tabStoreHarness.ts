/**
 * tabStore harness — proves loadTabs() actually fetches tabs (the bug in the
 * screenshot was an empty `loadTabs` stub that left the list at 0).
 */

interface MockTab {
  id: number;
  windowId: number;
  title: string;
  url: string;
  pinned?: boolean;
  active?: boolean;
}

const TABS: MockTab[] = [
  { id: 101, windowId: 1, title: "Tab A", url: "https://a.com", active: true },
  { id: 102, windowId: 1, title: "Tab B", url: "https://b.com", pinned: true },
  { id: 103, windowId: 1, title: "Tab C", url: "https://c.com" },
  { id: 201, windowId: 2, title: "Other window tab", url: "https://x.com" },
];

const ACTIVATED: { tabId?: number; windowId?: number } = {};
const STORE: Record<string, unknown> = {};

(globalThis as unknown as { chrome: unknown }).chrome = {
  tabs: {
    query: async (q: { windowId?: number }) =>
      q.windowId === undefined
        ? TABS
        : TABS.filter((t) => t.windowId === q.windowId),
    remove: async (ids: number[]) => {
      for (const id of ids) {
        const i = TABS.findIndex((t) => t.id === id);
        if (i >= 0) TABS.splice(i, 1);
      }
    },
    update: async (tabId: number) => {
      ACTIVATED.tabId = tabId;
    },
  },
  windows: {
    getAll: async () => [],
    update: async (windowId: number) => {
      ACTIVATED.windowId = windowId;
    },
  },
  storage: {
    local: {
      get: async (key: string) =>
        key in STORE ? { [key]: STORE[key] } : {},
      set: async (obj: Record<string, unknown>) => {
        Object.assign(STORE, obj);
      },
      remove: async (key: string) => {
        delete STORE[key];
      },
    },
  },
};

import { useTabStore } from "../browser-workspace-manager/src/stores/tabStore";

let passed = 0;
let failed = 0;
function check(label: string, cond: boolean, detail = "") {
  if (cond) {
    passed++;
    console.log(`  \u2713 ${label}`);
  } else {
    failed++;
    console.log(`  \u2717 ${label}${detail ? ` -> ${detail}` : ""}`);
  }
}

async function run() {
  console.log("TAB STORE HARNESS");

  const store = useTabStore.getState();

  // Before: empty (this is what the screenshot showed).
  check("starts empty", store.tabs.length === 0);

  // loadTabs for window 1 should pull exactly window 1's tabs.
  await useTabStore.getState().loadTabs(1);
  let s = useTabStore.getState();
  check(
    "loadTabs(1) populates 3 tabs",
    s.tabs.length === 3,
    `got ${s.tabs.length}`
  );
  check("loadTabs records currentWindowId", s.currentWindowId === 1);
  check(
    "does not leak window 2's tab",
    !s.tabs.some((t) => t.id === 201)
  );

  // Selection + close flow.
  useTabStore.getState().toggleSelectionMode();
  useTabStore.getState().toggleTabSelection(103);
  s = useTabStore.getState();
  check("tab 103 selected", s.selectedTabs.includes(103));

  await useTabStore.getState().closeSelectedTabs();
  s = useTabStore.getState();
  check(
    "closeSelectedTabs removes the tab + reloads",
    s.tabs.length === 2 && !s.tabs.some((t) => t.id === 103),
    `got ${s.tabs.length}`
  );
  check("selection cleared after close", s.selectedTabs.length === 0);

  // Clicking a tab (non-selection mode) switches to it: activate + focus window.
  useTabStore.getState().toggleSelectionMode(); // exit selection mode
  await useTabStore.getState().activateTab(102);
  check(
    "activateTab activates the right tab",
    ACTIVATED.tabId === 102,
    `got ${ACTIVATED.tabId}`
  );
  check(
    "activateTab focuses the tab's window",
    ACTIVATED.windowId === 1,
    `got ${ACTIVATED.windowId}`
  );

  // Favorite a tab -> persisted by URL + annotated on the tab.
  await useTabStore.getState().toggleTabFavorite(102);
  s = useTabStore.getState();
  check(
    "toggleTabFavorite marks the tab favorite",
    s.tabs.find((t) => t.id === 102)?.favorite === true
  );
  check(
    "favorite persisted by URL",
    (STORE["favoriteTabs"] as string[] | undefined)?.includes(
      "https://b.com"
    ) === true,
    JSON.stringify(STORE["favoriteTabs"])
  );

  // Toggling again removes it.
  await useTabStore.getState().toggleTabFavorite(102);
  s = useTabStore.getState();
  check(
    "toggling again unfavorites",
    s.tabs.find((t) => t.id === 102)?.favorite === false &&
      (STORE["favoriteTabs"] as string[]).length === 0
  );

  console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run();
