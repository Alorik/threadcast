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
      disabled={loading}
      className={`px-4 py-1 rounded-md border text-sm ${
        isFollowing
          ? "bg-gray-200 text-black"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      
      {loading
        ? "Loading..."
        : isFollowing
        ? "Following ▾" // you may change this text
        : "Follow"}
    </button>
  );
}
