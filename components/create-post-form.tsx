"use client";

import { useRouter } from "next/router";
import { useState } from "react";

export default function CreatePostForm() {
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!content.trim()) {
      setError("Post cannot be empty");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setLoading(false);

    if (!res.ok) {
      if (res.status === 401) {
        setError("You must be logged in to post.");
      } else {
        setError("Failed to create post.");
      }
      return;
    }

    setContent("");
    router.push("");
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-2 border rounded-md p-3">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded-md p-2 text-sm"
          placeholder="Post your content here"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="text-sm border px-3 py-1 rounded-md disabled:opacity-50"
        >
          {" "}
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
}
