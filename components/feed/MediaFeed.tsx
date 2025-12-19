"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/post/PostCard";

export default function MediaFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts/media")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="p-4 text-slate-400">Loading posts...</p>;
  }

  if (posts.length === 0) {
    return <p className="p-4 text-slate-500 text-sm">No media posts yet</p>;
  }

  return (
    <div className="space-y-8 pb-24">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
