import { authOptions } from "@/auth/config";
import LikeButton from "@/components/like-button";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Flame, TrendingUp } from "lucide-react";

export default async function ExplorePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const userId = session?.user?.id;
  const trendingPosts = await prisma.post.findMany({
    take: 10,
    orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
    select: {
      id: true,
      content: true,
      createdAt: true,
      type: true,

      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },

      media: {
        select: {
          id: true,
          url: true,
          type: true,
        },
      },

      _count: {
        select: {
          likes: true,
        },
      },

      likes: userId
        ? {
            where: { userId },
            select: { userId: true },
          }
        : false,
    },
  });

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 font-sans selection:bg-rose-500/30">
      {/* Static Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-rose-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <header className="mb-10 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/20 text-orange-400 shadow-lg shadow-orange-900/20">
            <Flame size={24} fill="currentColor" className="opacity-80" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Explore
            </h1>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
              <TrendingUp size={14} /> Trending today
            </p>
          </div>
        </header>

        {/* Trending Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingPosts.map((post, index) => {
            const likedByMe = post.likes?.length > 0;
            const firstMedia = post.media?.[0]; // Get first media item

            return (
              <div
                key={post.id}
                className="group relative bg-[#16181d] hover:bg-[#1a1d24] border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-black/40 flex flex-col"
              >
                {/* Rank Badge */}
                <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-[#20222a] border border-white/5 flex items-center justify-center text-xs font-bold text-slate-500 shadow-lg z-20 group-hover:scale-110 transition-transform">
                  #{index + 1}
                </div>

                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="relative shrink-0 group/avatar cursor-pointer">
                    <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-slate-700 to-slate-800 group-hover/avatar:from-indigo-500 group-hover/avatar:to-rose-500 transition-colors duration-300">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#16181d] relative">
                        {post.user.avatarUrl ? (
                          <Image
                            src={post.user.avatarUrl}
                            alt={post.user.username}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold bg-slate-800 text-sm">
                            {post.user.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-100 text-sm hover:text-indigo-400 transition-colors cursor-pointer truncate max-w-[120px]">
                        @{post.user.username}
                      </span>
                      <span className="text-[10px] text-slate-600 font-medium bg-white/5 px-2 py-1 rounded-full border border-white/5 shrink-0">
                        {new Date(post.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" }
                        )}
                      </span>
                    </div>

                    <p className="text-slate-300 text-[15px] leading-relaxed mb-4 font-light whitespace-pre-wrap flex-grow">
                      {post.content}
                    </p>

                    {/* Media Display - Fixed */}
                    {firstMedia && (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-slate-900 border border-white/5">
                        {firstMedia.type === "IMAGE" ? (
                          <Image
                            src={firstMedia.url}
                            alt="Post media"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : firstMedia.type === "VIDEO" ? (
                          <video
                            src={firstMedia.url}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center gap-6 pt-3 border-t border-white/5 mt-auto">
                      <div className="flex items-center gap-2 group/like">
                        <div className="p-1.5 rounded-full group-hover/like:bg-white/5 transition-colors">
                          <LikeButton postId={post.id} liked={likedByMe} />
                        </div>
                        <span className="text-xs text-slate-500 font-medium group-hover/like:text-slate-300 transition-colors">
                          {post._count.likes} likes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {trendingPosts.length === 0 && (
            <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
              <p className="text-slate-500 text-sm">No trending posts found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
