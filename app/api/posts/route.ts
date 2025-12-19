import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
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
        media: true,
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { content, media, parentId } = await req.json();
    const hasContent = content && content.trim().length > 0;
    const hasMedia = media && media.length > 0;

    if (!hasContent && !hasMedia) {
      return NextResponse.json(
        { error: "Post must have content or media" },
        { status: 400 }
      );
    }

    const type = hasMedia ? "POST" : "THREAD";

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content: hasContent ? content.trim() : null,
        type,
        parentId: parentId ?? null,
        media: hasMedia
          ? {
              create: media.map((m: any) => ({
                url: m.url,
                type: m.type,
              })),
            }
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        media: true,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
