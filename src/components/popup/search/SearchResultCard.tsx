import { useEffect, useRef, useState } from "react";
import {
  Archive,
  Bookmark,
  Clipboard,
  Clock,
  CornerDownLeft,
  Download,
  FileText,
  Globe,
  RotateCcw,
} from "lucide-react";

import type { SearchResult, SearchSource } from "../../../search/models";

type Props = {
  result: SearchResult;
  active?: boolean;
  onHover?: () => void;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, tokens: string[]): React.ReactNode {
  const usable = tokens.filter((t) => t.length > 0);
  if (usable.length === 0) {
    return text;
  }
  const pattern = new RegExp(`(${usable.map(escapeRegExp).join("|")})`, "ig");
  return text.split(pattern).map((part, index) =>
    usable.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
      <mark
        key={index}
        className="bg-transparent font-semibold text-neutral-900"
      >
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

const SOURCE_ICON: Record<
  SearchSource,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  workspace: Globe,
  tab: Globe,
  bookmark: Bookmark,
  history: Clock,
  download: Download,
  session: RotateCcw,
  archive: Archive,
  page: FileText,
  clipboard: Clipboard,
};

function ResultIcon({ result }: { result: SearchResult }) {
  const [errored, setErrored] = useState(false);

  // Real favicon for tabs.
  if (result.source === "tab" && result.icon && !errored) {
    return (
      <img
        src={result.icon}
        alt=""
        onError={() => setErrored(true)}
        className="h-5 w-5 rounded"
      />
    );
  }

  // Emoji for workspaces / archived workspaces.
  if (
    (result.source === "workspace" || result.source === "archive") &&
    result.icon
  ) {
    return <span className="text-lg leading-none">{result.icon}</span>;
  }

  const Icon = SOURCE_ICON[result.source as SearchSource] ?? Globe;
  return <Icon size={18} className="text-neutral-400" />;
}

export default function SearchResultCard({
  result,
  active = false,
  onHover,
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  const primary =
    result.actions.find((a) => a.primary) ?? result.actions[0];

  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ block: "nearest" });
    }
  }, [active]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => primary?.run()}
      onMouseEnter={onHover}
      onMouseDown={(e) => e.preventDefault()}
      className={[
        "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all",
        active
          ? "border-neutral-300 bg-white shadow-sm"
          : "border-transparent bg-white hover:border-neutral-200",
      ].join(" ")}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
        <ResultIcon result={result} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-neutral-700">
          {highlight(result.title, result.highlights ?? [])}
        </h3>
        {result.subtitle && (
          <p className="mt-0.5 truncate text-xs text-neutral-500">
            {result.subtitle}
          </p>
        )}
      </div>

      {active && (
        <span className="flex shrink-0 items-center gap-1 rounded-lg bg-neutral-900 px-2 py-1 text-[10px] font-medium text-white">
          <CornerDownLeft size={11} />
          {primary?.label ?? "Open"}
        </span>
      )}
    </button>
  );
}
