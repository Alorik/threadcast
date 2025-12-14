import { authOptions } from "@/auth/config";
import { pusherServer } from "@/lib/pusher-server";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.json();
  const socketId = formData.get("socket_id") as string;
  const channel = formData.get("channel_name") as string;

  if (!socketId || !channel) {
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  }

  const userData = {
    user_id: session.user.id,
    user_info: {
      username: session.user.username,
    },
  };

  const authResponse = pusherServer.authorizeChannel(
    socketId,
    channel,
    userData
  );

  return NextResponse.json(authResponse);
}
