import { authOptions } from "@/auth/config";
import { pusherServer } from "@/lib/pusher-server";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log("🔐 Session check:", {
      hasSession: !!session,
      userId: session?.user?.id,
      username: session?.user?.username,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📦 Request body:", body);

    const { conversationId, type, data } = body; // ← Added 'data' here

    console.log("🔍 Extracted values:", {
      conversationId,
      type,
      hasData: !!data, // ← Log if data exists
      conversationIdType: typeof conversationId,
      typeType: typeof type,
    });

    if (!conversationId || !type) {
      console.log("❌ Validation failed:", {
        hasConversationId: !!conversationId,
        hasType: !!type,
      });
      return NextResponse.json(
        {
          error: "Invalid payload",
          details: {
            conversationId: conversationId ? "present" : "missing",
            type: type ? "present" : "missing",
          },
        },
        { status: 400 }
      );
    }

    const channelName = `private-conversation-${conversationId}`;
    console.log("📡 Triggering Pusher:", {
      channel: channelName,
      event: type,
      hasData: !!data, // ← Log if data is present
    });

    await pusherServer.trigger(channelName, type, {
      userId: session.user.id,
      username: session.user.username,
      data: data, // ← THIS IS THE CRITICAL FIX - Include the WebRTC data
      timestamp: Date.now(),
    });

    console.log("✅ Pusher event sent successfully");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("💥 API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
