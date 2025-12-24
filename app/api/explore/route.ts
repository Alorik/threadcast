// app/api/explore/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // -------------------------
    // 🔥 Trending Posts
    // -------------------------
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
            comments: true,
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

    // -------------------------
    // 👤 Suggested Users
    // -------------------------
    const suggestedUsers = await prisma.user.findMany({
      take: 6,
      where: userId
        ? {
            id: { not: userId },
          }
        : undefined,
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      trendingPosts,
      suggestedUsers,
    });
  } catch (error) {
    console.error("❌ Explore API Error:", error);
    return NextResponse.json(
      { error: "Failed to load explore data" },
      { status: 500 }
    );
  }
}
