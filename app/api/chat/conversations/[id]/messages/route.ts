import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const { type, content, mediaUrl } = await req.json();

    if (!conversationId || !type) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (type === "TEXT" && !content) {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }

    if (type === "IMAGE" && !mediaUrl) {
      return NextResponse.json(
        { error: "Image URL required" },
        { status: 400 }
      );
    }

    // Verify membership
    const isMember = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        members: { some: { userId: session.user.id } },
      },
    });

    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Use transaction for consistency
    const message = await prisma.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: {
          conversationId,
          senderId: session.user.id,
          type,
          content: type === "TEXT" ? content : null,
          mediaUrl: type === "IMAGE" ? mediaUrl : null,
        },
        include: {
          sender: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
      });

      // Update conversation timestamp
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return newMessage;
    });

    // 🔥 FIX: Ensure the Pusher payload matches exactly what the frontend expects
    const pusherPayload = {
      id: message.id,
      type: message.type, // Ensure this is "IMAGE" or "TEXT"
      content: message.content || "", // Never send null
      mediaUrl: message.mediaUrl || "", // Never send null
      createdAt: message.createdAt.toISOString(),
      readAt: message.readAt ? message.readAt.toISOString() : null,
      sender: {
        id: message.sender.id,
        username: message.sender.username,
        avatarUrl: message.sender.avatarUrl,
      },
    };

    console.log("🚀 Pushing to Pusher:", pusherPayload); // Debug log

    // Push to Pusher
    await pusherServer.trigger(
      `private-conversation-${conversationId}`,
      "new-message",
      pusherPayload
    );

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error("❌ Message send error:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
