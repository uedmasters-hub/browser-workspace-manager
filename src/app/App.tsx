import { useEffect } from "react";

import Header from "../components/popup/Header";
import WindowSection from "../components/popup/WindowSection";
import SearchPanel from "../components/popup/search/SearchPanel";

import {
  MoveTabsDialog,
  ColorPickerDialog,
  EmojiPickerDialog,
} from "../components/popup/dialogs";

import ProviderRegistry from "../search/providers/ProviderRegistry";

import { registerWindowEvents } from "../browser/events/windowEvents";

import { useSearchStore } from "../stores/searchStore";

export default function App() {
  const query = useSearchStore((state) => state.query);
  const focused = useSearchStore((state) => state.focused);

  const showSearch = query.trim().length > 0 || focused;

  useEffect(() => {
    ProviderRegistry.initialize();

    // Keep the window list live while the popup is open.
    if (typeof chrome !== "undefined" && chrome.windows) {
      registerWindowEvents();
    }
  }, []);

  return (
    <>
      <main className="flex h-[640px] w-[420px] flex-col overflow-hidden bg-[#F6F7FB]">
        <Header />

        <section className="flex-1 overflow-y-auto">
          {showSearch ? <SearchPanel /> : <WindowSection />}
        </section>
      </main>

      <MoveTabsDialog />

      <ColorPickerDialog />

      <EmojiPickerDialog />
    </>
  );
}
