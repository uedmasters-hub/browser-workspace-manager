import type { MouseEvent } from "react";

import {
  MoreVertical,
  Star,
} from "lucide-react";

import RenameInput from "./RenameInput";

type Props = {
  title: string;

  emoji?: string;

  renaming: boolean;

  saving: boolean;

  isFavorite: boolean;

  isMenuOpen: boolean;

  onTitleChange: (
    value: string
  ) => void;

  onRenameSave: () => void | Promise<void>;

  onRenameCancel: () => void;

  onStartRename: () => void;

  onFavorite: (
    e: MouseEvent<HTMLButtonElement>
  ) => void | Promise<void>;

  onMenu: (
    e: MouseEvent<HTMLButtonElement>
  ) => void;
};

export default function WindowCardHeader({
  title,
  emoji,
  renaming,
  saving,
  isFavorite,
  isMenuOpen,
  onTitleChange,
  onRenameSave,
  onRenameCancel,
  onStartRename,
  onFavorite,
  onMenu,
}: Props) {
  return (
    <div className="flex items-start justify-between">
      <div
        className="min-w-0 flex-1"
        onDoubleClick={(e) => {
          e.stopPropagation();
          onStartRename();
        }}
      >
        <div className="flex items-center gap-2">
          {emoji && (
            <span className="text-lg leading-none">
              {emoji}
            </span>
          )}

          {renaming ? (
            <RenameInput
              value={title}
              disabled={saving}
              onChange={onTitleChange}
              onSave={onRenameSave}
              onCancel={onRenameCancel}
            />
          ) : (
            <h3 className="truncate text-base font-medium text-neutral-800">
              {title}
            </h3>
          )}
        </div>
      </div>

      <div className="ml-3 flex items-center gap-1">
        <button
          type="button"
          onClick={onFavorite}
          className="rounded-lg p-1 transition hover:bg-black/5"
        >
          <Star
            size={18}
            strokeWidth={2.2}
            fill={
              isFavorite
                ? "currentColor"
                : "none"
            }
          />
        </button>

        <button
          type="button"
          onClick={onMenu}
          className={[
            "rounded-lg p-1 transition",
            isMenuOpen
              ? "bg-black/10"
              : "hover:bg-black/5",
          ].join(" ")}
        >
          <MoreVertical
            size={18}
          />
        </button>
      </div>
    </div>
  );
}