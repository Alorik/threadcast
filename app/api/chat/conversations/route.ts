//api/chat/conversations/route.ts
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

    // First, let's check if there are any conversation members for this user
    const memberCheck = await prisma.conversationMember.findMany({
      where: { userId },
      select: { conversationId: true },
    });
    console.log("🔍 Member check - User is in conversations:", memberCheck);

    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
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
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log("✅ API: Found conversations:", conversations.length);

    // More detailed logging
    if (conversations.length > 0) {
      console.log("✅ API: First conversation details:", {
        id: conversations[0].id,
        memberCount: conversations[0].members.length,
        messageCount: conversations[0].messages.length,
        members: conversations[0].members.map((m) => ({
          userId: m.userId,
          username: m.user.username,
        })),
      });
    }

    // Format the response to ensure messages array is always present
    const formattedConversations = conversations.map((conv) => ({
      ...conv,
      messages: conv.messages || [],
    }));

    return NextResponse.json(formattedConversations);
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
