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

    const { conversationId, content } = body;

    if (!conversationId || !content) {
      return NextResponse.json({ error: "Invalid Payload" }, { status: 400 });
    }

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

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
