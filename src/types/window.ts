export interface WorkspaceWindow {
  id: number;

  name: string;

  color: string;

  emoji?: string;

  coverImage?: string;

  tabCount: number;

  isActive: boolean;

  isFavorite: boolean;

  isArchived: boolean;

  createdAt: string;

  updatedAt: string;

  chromeWindowId?: number;
}