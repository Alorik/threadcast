import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("❌ No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📦 Received body:", body); // ✅ Debug log

    const { conversationId, content } = body;

    console.log("🔍 Validation:", {
      conversationId,
      content,
      hasConversationId: !!conversationId,
      hasContent: !!content,
    }); // ✅ Debug log

    if (!conversationId || !content) {
      console.log("❌ Invalid payload - missing conversationId or content");
      return NextResponse.json({ error: "Invalid Payload" }, { status: 400 });
    }

    console.log("✅ Creating message...");
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content,
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

    console.log("✅ Message created:", message.id);

    const messageForPusher = {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      sender: message.sender,
    };

    await pusherServer.trigger(
      `private-conversation-${conversationId}`,
      "new-message",
      messageForPusher
    );

    console.log("✅ Message sent via Pusher");

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("❌ Error in POST /api/chat/messages:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
