"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePostForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let mediaUrl = null;

    // 1. Upload image if exists
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (uploadData.url) {
        mediaUrl = uploadData.url;
      }
    }

    // 2. Create post
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, mediaUrl }),
    });

    setContent("");
    setFile(null);
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border p-2 rounded"
        placeholder="What's happening?"
        required
      />

      {/* Image input */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      {/* Preview */}
      {file && (
        <img
          src={URL.createObjectURL(file)}
          className="h-40 object-cover rounded"
        />
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-2  border rounded text-sm"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
