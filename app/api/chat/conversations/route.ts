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

    // Find all conversations where user is a member
    const allConversations = await prisma.conversation.findMany({
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
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log("🔵 API: All conversations found:", allConversations.length);

    // For each conversation, fetch the last message separately
    const conversationsWithLastMessage = await Promise.all(
      allConversations.map(async (conv) => {
        // Only fetch last message if conversation has messages
        const lastMessage = conv._count.messages > 0
          ? await prisma.message.findFirst({
              where: { conversationId: conv.id },
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                content: true,
                createdAt: true,
                senderId: true,
              },
            })
          : null;

        return {
          id: conv.id,
          updatedAt: conv.updatedAt.toISOString(),
          members: conv.members.map((m) => ({
            userId: m.userId,
            user: m.user,
          })),
          messages: lastMessage
            ? [
                {
                  id: lastMessage.id,
                  content: lastMessage.content,
                  createdAt: lastMessage.createdAt.toISOString(),
                  senderId: lastMessage.senderId,
                },
              ]
            : [],
        };
      })
    );

    // Filter to only conversations with messages
    const conversations = conversationsWithLastMessage.filter(
      (conv) => conv.messages.length > 0
    );

    console.log("✅ API: Conversations with messages:", conversations.length);
    console.log(
      "✅ API: First conversation:",
      conversations[0] ? JSON.stringify(conversations[0], null, 2) : "None"
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
