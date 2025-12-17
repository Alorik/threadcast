"use client";

import { useState, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";

type LikeButtonProps = {
  postId: string;
  liked: boolean;
};

export default function LikeButton({ postId, liked }: LikeButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // We use local state to simulate the optimistic update for the demo
  const [isLiked, setIsLiked] = useState(liked);

  async function handleLike() {
    setError(null);

    // Simulate network delay for the demo since we don't have a real API/Router here
    const fakeNetworkRequest = () =>
      new Promise((resolve) => setTimeout(resolve, 500));

    startTransition(async () => {
      try {
        await fakeNetworkRequest();
        setIsLiked(!isLiked);
        // In a real Next.js app, you would call router.refresh() here
      } catch (err) {
        setError("Error");
      }
    });
  }

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={handleLike}
        disabled={isPending}
        className={`
          group relative flex items-center justify-center p-2 rounded-full transition-all duration-300
          focus:outline-none disabled:cursor-not-allowed
          ${
            isLiked
              ? "text-rose-500 hover:bg-rose-500/10"
              : "text-slate-500 hover:text-rose-500 hover:bg-rose-500/10"
          }
        `}
        aria-label={isLiked ? "Unlike" : "Like"}
      >
        {isPending ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Heart
            size={20}
            className={`
              transition-transform duration-200 active:scale-90
              ${isLiked ? "fill-current scale-100" : "group-hover:scale-110"}
            `}
          />
        )}
      </button>

      {error && (
        <span className="absolute left-full ml-2 text-[10px] font-medium text-rose-500 whitespace-nowrap animate-in fade-in slide-in-from-left-1">
          {error}
        </span>
      )}
    </div>
  );
}
