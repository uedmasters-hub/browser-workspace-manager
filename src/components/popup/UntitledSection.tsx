import SectionHeader from "./SectionHeader";
import TabItem from "./TabItem";
import BulkActionBar from "./BulkActionBar";

import { useWindowStore } from "../../stores/windowStore";
import { useTabStore } from "../../stores/tabStore";

export default function UntitledSection() {
  const tabs = useTabStore((state) => state.tabs);

  const selectedWindowId = useWindowStore(
    (state) => state.selectedWindowId
  );

  if (!selectedWindowId) {
    return null;
  }

  // Favorites first, then pinned, then the rest (stable within each band).
  const orderedTabs = [...tabs].sort((a, b) => {
    const favDelta = Number(b.favorite) - Number(a.favorite);
    if (favDelta !== 0) {
      return favDelta;
    }

    return Number(b.pinned) - Number(a.pinned);
  });

  return (
    <>
      <SectionHeader title={`Tabs (${orderedTabs.length})`} />

      {orderedTabs.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-gray-400">
          No tabs in this window.
        </div>
      ) : (
        orderedTabs.map((tab) => (
          <TabItem
            key={tab.id}
            id={tab.id}
            title={tab.title}
            favicon={tab.favicon}
            pinned={tab.pinned}
            favorite={tab.favorite}
            time={
              tab.favorite
                ? "Favorite"
                : tab.pinned
                  ? "Pinned"
                  : undefined
            }
          />
        ))
      )}

      <BulkActionBar />
    </>
  );
}
