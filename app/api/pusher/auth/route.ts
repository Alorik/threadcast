import { authOptions } from "@/auth/config";
import { pusherServer } from "@/lib/pusher-server";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ FIX: Read as FormData, not JSON
  const body = await req.text(); // Get raw body
  const params = new URLSearchParams(body);

  const socketId = params.get("socket_id");
  const channel = params.get("channel_name");

  if (!socketId || !channel) {
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  }

  const userData = {
    user_id: session.user.id,
    user_info: {
      username: session.user.username,
      avatarUrl: session.user.image,
    },
  };

  const authResponse = pusherServer.authorizeChannel(
    socketId,
    channel,
    userData
  );

  return NextResponse.json(authResponse);
}

