import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params in Next.js 15+
    const { messageId } = await params;

    console.log("Deleting message:", messageId);

    // Validate messageId
    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Fetch message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Only sender can delete
    if (message.senderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete
    const deleted = await prisma.message.update({
      where: { id: messageId },
      data: {
        type: "TEXT",
        content: "🗑️ This message was deleted",
        mediaUrl: null,
      },
      include: {
        sender: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    // Notify realtime
    await pusherServer.trigger(
      `private-conversation-${deleted.conversationId}`,
      "message:deleted",
      {
        id: deleted.id,
        content: deleted.content,
        type: deleted.type,
        mediaUrl: null,
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete message error:", err);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
