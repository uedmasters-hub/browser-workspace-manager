import { useTabStore } from "../../stores/tabStore";

type Props = {
  title: string;
};

export default function SectionHeader({
  title,
}: Props) {
  const selectionMode = useTabStore(
    (state) => state.selectionMode
  );

  const selectedTabs = useTabStore(
    (state) => state.selectedTabs
  );

  const toggleSelectionMode = useTabStore(
    (state) => state.toggleSelectionMode
  );

  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-3">
      <h2 className="text-xl font-semibold">
        {selectionMode
          ? `${selectedTabs.length} Selected`
          : title}
      </h2>

      <button
        onClick={toggleSelectionMode}
        className="text-sm font-medium text-gray-500 hover:text-black"
      >
        {selectionMode
          ? "Cancel"
          : "Select"}
      </button>
    </div>
  );
}