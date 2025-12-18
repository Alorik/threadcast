"use client";

import { useState } from "react";

type FeedTab = "threads" | "media";

export default function FeedTab({
  onChange,
}: {
  onChange: (tab: FeedTab) => void;
  }) {
  
  const [active, setActive] = useState<FeedTab>("threads");

  const handleClick = (tab: FeedTab) => {
    setActive(tab);
    onChange(tab);
  }

  return (
    <div className="flex gap-6 border-b border-white/10 px-4">
      <button
        onClick={() => handleClick("threads")}
        className={`pb-3 text-sm font-medium transition-colors ${
          active === "threads"
            ? "text-white border-b-2 border-indigo-500"
            : "text-slate-400"
        }`}
      >
        Threads
      </button>

      <button
        onClick={() => handleClick("media")}
        className={`pb-3 text-sm font-medium transition-colors ${
          active === "media"
            ? "text-white border-b-2 border-indigo-500"
            : "text-slate-400"
        }`}
      >
        Media
      </button>
    </div>
  );
}
