import { authOptions } from "@/auth/config";
import { pusherServer } from "@/lib/pusher-server";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("🔐 API /call/signal - Session:", {
      hasSession: !!session,
      userId: session?.user?.id,
      username: session?.user?.username,
    });

    if (!session?.user?.id) {
      console.error("❌ Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📦 API Request body:", {
      conversationId: body.conversationId,
      type: body.type,
      hasData: !!body.data,
    });

    const { conversationId, type, data } = body;

    if (!conversationId || !type) {
      console.error("❌ Missing required fields:", {
        hasConversationId: !!conversationId,
        hasType: !!type,
      });
      return NextResponse.json(
        { error: "Missing conversationId or type" },
        { status: 400 }
      );
    }

    const channelName = `private-conversation-${conversationId}`;

    // Prepare the payload
    const payload = {
      userId: session.user.id,
      username: session.user.username || session.user.name || "Unknown",
      timestamp: Date.now(),
      ...(data && { data }), // Include data if present
    };

    console.log("📡 Triggering Pusher event:", {
      channel: channelName,
      event: type,
      payload: JSON.stringify(payload).substring(0, 150) + "...",
    });

    // Trigger the Pusher event
    await pusherServer.trigger(channelName, type, payload);

    console.log("✅ Pusher event triggered successfully");

    return NextResponse.json({
      ok: true,
      event: type,
      channel: channelName,
    });
  } catch (error) {
    console.error("💥 API Error in /call/signal:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
