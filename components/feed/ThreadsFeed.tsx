"use client";

import { useState, useEffect } from "react";

export default function ThreadsFeed() {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts/threads")
      .then((res) => res.json())
      .then((data) => {
        setThreads(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="p-4 text-slate-400">Loading threads...</p>;
  }

  return (
    <div className="divide-y divide-white/5">
      {threads.map((thread) => (
        <div key={thread.id} className="px-4 py-3 hover:bg-white/5">
          <p className="text-white text-sm leading-relaxed">{thread.content}</p>
        </div>
      ))}
    </div>
  );
}
