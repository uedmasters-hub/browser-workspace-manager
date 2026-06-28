import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { Menu, Search, X } from "lucide-react";

import { useSearchStore } from "../../stores/searchStore";

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) {
    return false;
  }

  const tag = el.tagName;

  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    el.isContentEditable
  );
}

export default function Header() {
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);
  const search = useSearchStore((state) => state.search);
  const discover = useSearchStore((state) => state.discover);
  const clear = useSearchStore((state) => state.clear);
  const deepMode = useSearchStore((state) => state.deepMode);
  const focused = useSearchStore((state) => state.focused);
  const setFocused = useSearchStore((state) => state.setFocused);
  const moveActive = useSearchStore((state) => state.moveActive);
  const runActive = useSearchStore((state) => state.runActive);

  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced engine call. Typing searches; an empty box (while focused)
  // shows discovery.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        search(query);
      } else if (focused) {
        discover();
      }
    }, 160);

    return () => clearTimeout(timer);
  }, [query, focused, search, discover]);

  // Focus-search hotkeys: "/" (when not already typing) and Cmd/Ctrl+F.
  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      const slash =
        event.key === "/" && !isTypingTarget(event.target);

      const findCombo =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "f";

      if (slash || findCombo) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;

      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;

      case "Enter":
        event.preventDefault();
        runActive();
        break;

      case "Escape":
        event.preventDefault();
        clear();
        event.currentTarget.blur();
        break;
    }
  }

  return (
    <header className="sticky top-0 z-10 bg-white">
      <div className="flex items-center gap-3 p-5">
        <div
          className={[
            "flex flex-1 items-center rounded-2xl border bg-white px-4 py-3 shadow-sm transition-colors",
            deepMode
              ? "border-violet-400 ring-1 ring-violet-200"
              : focused
                ? "border-neutral-400"
                : "border-gray-200",
          ].join(" ")}
        >
          <Search size={18} className="mr-3 shrink-0 text-gray-400" />

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search tabs and workspaces..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />

          {query ? (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="ml-2 shrink-0 text-gray-400 transition-colors hover:text-gray-700"
            >
              <X size={16} />
            </button>
          ) : (
            <kbd className="ml-2 hidden shrink-0 rounded border border-neutral-200 bg-neutral-50 px-1.5 text-[11px] font-medium text-neutral-400 sm:block">
              /
            </kbd>
          )}
        </div>

        <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-gray-100">
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}
