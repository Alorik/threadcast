import { authOptions } from "@/auth/config";
import CommentForm from "@/components/comments-form";
import CreatePostForm from "@/components/create-post-form";
import LikeButton from "@/components/like-button"; // Reverted to standard LikeButton
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import ResponsiveSidebar from "@/components/navbar";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ?? "";

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: { likes: true, comments: true },
      },
      likes: {
        where: {
          userId: currentUserId,
        },
        select: {
          userId: true,
        },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: {
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 selection:bg-rose-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>
      <div className="flex items-center justify-between">
        <div className="relative z-10 max-w-2xl mx-auto py-10 px-4">
          {/* Header */}
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent tracking-tight">
              Feed
            </h1>
            {/* User Avatar Placeholder or Link to Profile */}
            <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 overflow-hidden relative">
              {session?.user?.image && (
                <Image
                  src={session.user.image}
                  alt="Me"
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </header>

          {/* Create Post Section */}
   

          {/* Feed List */}
          <div className="space-y-6">
            {posts.length === 0 && (
              <div className="text-center py-12 rounded-3xl border border-dashed border-white/10">
                <p className="text-slate-500">
                  No posts yet. Be the first to share something!
                </p>
              </div>
            )}

            {posts.map((post) => (
              <article
                key={post.id}
                className="group relative bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-md transition-all hover:bg-slate-900/60 hover:border-white/10 shadow-lg"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative h-10 w-10 shrink-0">
                      {post.user?.avatarUrl ? (
                        <Image
                          src={post.user.avatarUrl}
                          alt={post.user.username ?? "User"}
                          fill
                          className="rounded-full object-cover ring-2 ring-[#0f1115]"
                        />
                      ) : (
                        <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-inner ring-2 ring-[#0f1115]">
                          {post.user?.username?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div>
                      <h3 className="font-semibold text-slate-100 text-sm leading-tight">
                        {post.user?.username ?? "Unknown"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {new Date(post.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <button className="text-slate-500 hover:text-white transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                {/* Post Content */}
                <div className="mb-4 space-y-3">
                  {post.content && (
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  )}

                  {post.mediaUrl && (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-800 border border-white/5">
                      <Image
                        src={post.mediaUrl}
                        alt="Post media"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 768px"
                      />
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                <div className="flex items-center gap-6 border-t border-white/5 pt-4 mb-4">
                  <div className="flex items-center gap-2">
                    <LikeButton
                      postId={post.id}
                      liked={post.likes?.length > 0}
                    />
                    <span className="text-xs text-slate-400 font-medium">
                      {post._count?.likes ?? 0}
                    </span>
                  </div>

                  <button className="flex items-center gap-2 group/comment">
                    <MessageCircle
                      size={20}
                      className="text-slate-500 group-hover/comment:text-cyan-400 transition-colors"
                    />
                    <span className="text-xs text-slate-400 group-hover/comment:text-cyan-400 transition-colors font-medium">
                      {post._count?.comments ?? 0}
                    </span>
                  </button>

                  <button className="ml-auto text-slate-500 hover:text-white transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>

                {/* Comments Section */}
                <div className="bg-black/20 rounded-xl p-4 space-y-4">
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                      {post.comments.map((c) => (
                        <div key={c.id} className="flex gap-2 text-sm group/c">
                          <span className="font-bold text-slate-400 text-xs shrink-0 mt-0.5">
                            {c.user?.username}:
                          </span>
                          <p className="text-slate-300 text-xs leading-relaxed">
                            {c.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <div className="pt-2">
                    <CommentForm postId={post.id} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div>
          <ResponsiveSidebar />
        </div>
      </div>
    </div>
  );
}
