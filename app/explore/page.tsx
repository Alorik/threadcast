import { authOptions } from "@/auth/config";
import LikeButton from "@/components/like-button";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Image from "next/image";

export default async function ExplorePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unuserized" }, { status: 401 });
  }

  const userId = session?.user?.id;

  const trendingPosts = await prisma.post.findMany({
    take: 10,
    orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
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
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* Page Header */}
      <h1 className="text-2xl font-bold text-white">Explore 🔥</h1>

      {/* Trending Posts */}
      <div className="space-y-4">
        {trendingPosts.map((post) => {
          const likedByMe = post.likes?.length > 0;

          return (
            <div
              key={post.id}
              className="rounded-xl border border-white/10 bg-[#0f1115] p-4 space-y-3"
            >
              {/* user */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                  {post.user.avatarUrl ? (
                    <Image
                      src={post.user.avatarUrl}
                      alt={post.user.username}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                      {post.user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>

                <span className="text-white font-medium">
                  @{post.user.username}
                </span>
              </div>

              {/* Content */}
              <p className="text-slate-200 text-sm leading-relaxed">
                {post.content}
              </p>

              {/* Footer */}
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <LikeButton
                  postId={post.id}
                  liked={likedByMe}
                  likeCount={post._count.likes}
                />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}

        {trendingPosts.length === 0 && (
          <p className="text-slate-500 text-sm">No trending posts yet.</p>
        )}
      </div>
    </div>
  );
}
