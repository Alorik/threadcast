import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
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

    // Await params to get the id
    const { id: conversationId } = await params;
    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Verify user is a member of this conversation
    const membership = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this conversation" },
        { status: 403 }
      );
    }

    // Create the message - use senderId instead of userId
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        conversationId,
        senderId: session.user.id, // Changed from userId to senderId
      },
      include: {
        sender: {
          // Changed from user to sender
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Message creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET messages for a conversation
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params to get the id
    const { id: conversationId } = await params;

    // Verify user is a member
    const membership = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this conversation" },
        { status: 403 }
      );
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          // Changed from user to sender
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
