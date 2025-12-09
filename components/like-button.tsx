"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type LikeButtonProps = {
  postId: string;
};

export default function LikeButton({ postId }: LikeButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleLike() {
    setError(null);

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (res.status === 401) {
        setError("You must be logged in to like.");
        return;
      }

      if (!res.ok) {
        setError("Failed to like post.");
        return;
      }

      // re-fetch posts on the server
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError("Something went wrong.");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleLike}
        disabled={isPending}
        className="border px-2 py-1 rounded text-xs disabled:opacity-50"
      >
        {isPending ? "Liking..." : "Like"}
      </button>
      {error && <span className="text-[10px] text-red-500">{error}</span>}
    </div>
  );
}
