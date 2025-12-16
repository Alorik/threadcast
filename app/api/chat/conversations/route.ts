import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("🔵 API: /api/chat/conversations called");

  try {
    const session = await getServerSession(authOptions);
    console.log("🔵 API: Session:", session?.user?.id);

    if (!session?.user?.id) {
      console.log("❌ API: No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("🔵 API: Fetching conversations for user:", userId);

    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log("✅ API: Found conversations:", conversations.length);
    console.log(
      "✅ API: Conversations:",
      JSON.stringify(conversations, null, 2)
    );

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
