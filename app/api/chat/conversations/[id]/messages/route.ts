//api/chat/conversations/[id]/messages/route.ts
import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📦 Received body:", body);

    const { conversationId, content } = body;

    console.log("🔍 Validation:", {
      conversationId,
      content,
      hasConversationId: !!conversationId,
      hasContent: !!content,
    });

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user is a member of this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    console.log("✅ Creating message...");

    // Create message and update conversation in a transaction
    const message = await prisma.$transaction(async (tx) => {
      // Create the message
      const newMessage = await tx.message.create({
        data: {
          content,
          conversationId,
          senderId: session.user.id,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Update conversation's updatedAt timestamp
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return newMessage;
    });

    console.log("✅ Message created:", message.id);

    // Trigger Pusher event
    await pusherServer.trigger(
      `conversation-${conversationId}`,
      "new-message",
      {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        sender: message.sender,
      }
    );

    console.log("✅ Message sent via Pusher");

    return NextResponse.json(
      {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        sender: message.sender,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating message:", error);
    return NextResponse.json(
      {
        error: "Failed to send message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
