"use client";

import { useState } from "react";

export default function FollowButton({
  targetUserId,
  isFollowingInitial,
}: {
  targetUserId: string;
  isFollowingInitial: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(isFollowingInitial);
  const [loading, setLoading] = useState(false);

  async function handleFollow() {
    setLoading(true);
    const res = await fetch(`/api/users/${targetUserId}/follow`, {
      method: isFollowing ? "DELETE" : "POST",
    });

    if (res.ok) {
      setIsFollowing(!isFollowing);
    }

    setLoading(false);
  }
  return (
    <button
      onClick={handleFollow}
      className={`
        px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 border cursor-pointer
        ${
          isFollowing
            ? "bg-transparent border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-500"
            : "bg-neutral-200 border-transparent text-neutral-900 hover:bg-neutral-300"
        }
      `}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
