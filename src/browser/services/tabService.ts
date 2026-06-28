import type { WorkspaceTab } from "../../types/tab";

function mapChromeTab(
  tab: chrome.tabs.Tab
): WorkspaceTab {
  return {
    id: tab.id ?? -1,
    windowId: tab.windowId,
    title: tab.title ?? "",
    url: tab.url ?? "",
    favicon: tab.favIconUrl,
    pinned: tab.pinned,
    active: tab.active,
    favorite: false,
    audible: tab.audible ?? false,
    discarded: tab.discarded ?? false,
    lastAccessed: tab.lastAccessed,
  };
}

export async function getTabs(
  chromeWindowId: number
): Promise<WorkspaceTab[]> {
  const tabs = await chrome.tabs.query({
    windowId: chromeWindowId,
  });

  return tabs.map(mapChromeTab);
}

export async function getAllTabs(): Promise<WorkspaceTab[]> {
  const tabs = await chrome.tabs.query({});

  return tabs.map(mapChromeTab);
}

export async function getActiveTab(): Promise<
  WorkspaceTab | undefined
> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tab ? mapChromeTab(tab) : undefined;
}