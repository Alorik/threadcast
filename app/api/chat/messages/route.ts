import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorizes" }, { status: 401 });
  }

  const { conversationId, content } = await req.json();
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

  await pusherServer.trigger(
    `private-conversation-${conversationId}`,
    "new-message",
    message,
  );

  return NextResponse.json(message, { status: 201 });

}
