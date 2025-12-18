"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

  return (
    <div className="space-y-6 p-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="rounded-xl overflow-hidden border border-white/10"
        >
          {post.media?.[0] && (
            <Image
              height={400}
              width={400}
              src={post.media[0].url}
              alt="postimg"
              className="w-full object-cover"
            />
          )}

          {post.content && (
            <p className="p-3 text-slate-200 text-sm">{post.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}
