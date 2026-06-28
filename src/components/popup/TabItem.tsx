import { Check, Pin, Star } from "lucide-react";

import { useTabStore } from "../../stores/tabStore";

type Props = {
  id: number;
  title: string;
  favicon?: string;
  pinned?: boolean;
  favorite?: boolean;
  time?: string;
};

export default function TabItem({
  id,
  title,
  favicon,
  pinned = false,
  favorite = false,
  time,
}: Props) {
  const selectionMode = useTabStore(
    (state) => state.selectionMode
  );

  const selectedTabs = useTabStore(
    (state) => state.selectedTabs
  );

  const toggleTabSelection = useTabStore(
    (state) => state.toggleTabSelection
  );

  const activateTab = useTabStore(
    (state) => state.activateTab
  );

  const toggleTabFavorite = useTabStore(
    (state) => state.toggleTabFavorite
  );

  const isSelected = selectedTabs.includes(id);

  return (
    <div
      onClick={() => {
        if (selectionMode) {
          toggleTabSelection(id);
        } else {
          activateTab(id);
        }
      }}
      className="mx-5 mb-3 flex cursor-pointer items-center rounded-2xl bg-white px-4 py-4 shadow-sm transition-all hover:bg-neutral-50 active:scale-[0.99]"
    >
      {selectionMode ? (
        <div
          className={[
            "mr-4 flex h-5 w-5 items-center justify-center rounded-md border",
            isSelected
              ? "border-black bg-black text-white"
              : "border-neutral-300",
          ].join(" ")}
        >
          {isSelected && <Check size={14} />}
        </div>
      ) : (
        <div className="mr-3 flex h-6 w-6 items-center justify-center">
          {favicon ? (
            <img
              src={favicon}
              alt=""
              className="h-5 w-5 rounded"
            />
          ) : (
            <div className="h-3 w-3 rounded-full bg-violet-500" />
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-neutral-900">
            {title}
          </p>

          {pinned && (
            <Pin
              size={12}
              fill="currentColor"
              className="shrink-0 text-neutral-500"
            />
          )}
        </div>

        {time && (
          <p className="mt-1 text-xs text-neutral-400">
            {time}
          </p>
        )}
      </div>

      {!selectionMode && (
        <button
          type="button"
          aria-label={
            favorite ? "Remove favorite" : "Add favorite"
          }
          onClick={(e) => {
            e.stopPropagation();
            toggleTabFavorite(id);
          }}
          className={[
            "ml-2 shrink-0 rounded-lg p-1.5 transition-colors",
            favorite
              ? "text-amber-400 hover:bg-amber-50"
              : "text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500",
          ].join(" ")}
        >
          <Star
            size={16}
            strokeWidth={2.2}
            fill={favorite ? "currentColor" : "none"}
          />
        </button>
      )}
    </div>
  );
}
