import type {
  SearchableEntity,
} from "./SearchableEntity";

export interface SearchableWorkspace
  extends SearchableEntity {
  workspaceId: number;

  chromeWindowId: number;

  favorite: boolean;

  archived: boolean;

  tabCount: number;
}