import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { success } from "zod";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await req.json();

  const updated = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: session.user.id },
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  await pusherServer.trigger(
    `private-conversation-${conversationId}`,
    "message:read",
    {
      readerId: session.user.id,
    }
  );

  return NextResponse.json({ success: true, updated });
}
