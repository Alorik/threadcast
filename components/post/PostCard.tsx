"use client";

import Image from "next/image";
import LikeButton from "@/components/like-button";
import CommentForm from "@/components/comments-form";
import { MessageCircle, Share2, MoreHorizontal } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  user?: {
    username: string;
  };
}

interface Media {
  url: string;
  type: string;
}

interface Post {
  id: string;
  content?: string;
  createdAt: string;
  media: Media[];
  user?: {
    username?: string;
    avatarUrl?: string;
  };
  likes?: unknown[];
  comments?: Comment[];
  _count?: {
    likes: number;
    comments: number;
  };
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <article
      key={post.id}
      className="group relative bg-zinc-900/20 border border-white/5 rounded-3xl p-6 backdrop-blur-sm hover:bg-zinc-900/40 hover:border-white/10 transition-all duration-300"
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0">
            {post.user?.avatarUrl ? (
              <Image
                src={post.user.avatarUrl}
                alt={post.user.username ?? "User"}
                fill
                className="rounded-full object-cover ring-2 ring-black"
              />
            ) : (
              <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-black">
                {post.user?.username?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h3 className="font-bold text-slate-100 text-sm hover:text-indigo-400 transition-colors cursor-pointer">
              {post.user?.username ?? "Unknown"}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <button className="text-slate-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4 pl-[52px]">
        {post.content && (
          <p className="text-[15px] text-slate-300 leading-relaxed whitespace-pre-wrap font-light">
            {post.content}
          </p>
        )}

        {post.media[0]?.url && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-white/5 shadow-lg group-hover:shadow-indigo-500/5 transition-all">
            <Image
              src={post.media[0].url}
              alt="Post media"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Actions & Stats */}
        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <LikeButton
              postId={post.id}
              liked={(post.likes?.length ?? 0) > 0}
            />
            <span className="text-xs text-slate-500 font-medium min-w-[1rem]">
              {(post._count?.likes ?? 0) > 0 && post._count?.likes}
            </span>
          </div>

          <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors group/comment">
            <MessageCircle
              size={20}
              className="group-hover/comment:scale-110 transition-transform"
            />
            <span className="text-xs font-medium">
              {(post._count?.comments ?? 0) > 0 ? post._count?.comments : ""}
            </span>
          </button>

          <button className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors ml-auto">
            <Share2 size={18} />
          </button>
        </div>

        {/* Comments Preview */}
        {post.comments && post.comments.length > 0 && (
          <div className="pt-4 border-t border-white/5 space-y-3">
            {post.comments.slice(0, 2).map((c: Comment) => (
              <div key={c.id} className="flex gap-2 text-sm group/comment">
                <span className="font-bold text-slate-400 text-xs shrink-0 mt-0.5">
                  {c.user?.username}:
                </span>
                <p className="text-slate-400 text-xs leading-relaxed group-hover/comment:text-slate-300 transition-colors">
                  {c.content}
                </p>
              </div>
            ))}
            {post.comments.length > 2 && (
              <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                View all {post.comments.length} comments
              </button>
            )}
          </div>
        )}

        {/* Add Comment */}
        <div className="pt-2">
          <CommentForm postId={post.id} />
        </div>
      </div>
    </article>
  );
}
