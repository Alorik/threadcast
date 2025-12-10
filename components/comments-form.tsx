"use client"

import { useRouter } from "next/navigation";
import { useState } from "react"

// { params }: { params: Promise<{ postId: string }> 
export default function CommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setContent("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={submitComment} className="mt-2 flex gap-2">
      <input
        onChange={(e) => setContent(e.target.value)}
        type="text"
        placeholder="Write a comment..."
        value={content}
      />

      <button
        type="submit"
        disabled={loading}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        {loading ? "..." : "Post"}
      </button>
    </form>
  );
}