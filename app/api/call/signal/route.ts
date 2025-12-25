import { authOptions } from "@/auth/config";
import { pusherServer } from "@/lib/pusher-server";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, type } = await req.json();

  if (!conversationId || !type) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await pusherServer.trigger(`private-conversation-${conversationId}`, type, {
    userId: session.user.id,
    timestamp: Date.now(),
  });
  return NextResponse.json({ ok: true });
}
