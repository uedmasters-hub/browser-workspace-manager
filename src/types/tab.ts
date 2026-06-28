export interface WorkspaceTab {
  id: number;

  windowId: number;

  title: string;

  url: string;

  favicon?: string;

  pinned: boolean;

  active: boolean;

  favorite: boolean;

  audible: boolean;

  discarded: boolean;

  lastAccessed?: number;
}