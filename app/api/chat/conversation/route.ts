import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { targetUserId } = await req.json();
  const currentUserId = session.user.id;

  if (!targetUserId || targetUserId === currentUserId) {
    return NextResponse.json({ error: "Invalid Target User" }, { status: 400 });
  }

  // Find conversation with EXACTLY these two users
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        {
          members: {
            some: {
              userId: currentUserId,
            },
          },
        },
        {
          members: {
            some: {
              userId: targetUserId,
            },
          },
        },
      ],
    },
    include: {
      members: true,
    },
  });

  // Verify it's exactly a 2-person conversation
  if (existingConversation && existingConversation.members.length === 2) {
    return NextResponse.json(existingConversation);
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      members: {
        createMany: {
          data: [{ userId: currentUserId }, { userId: targetUserId }],
        },
      },
    },
    include: {
      members: true,
    },
  });

  return NextResponse.json(conversation, { status: 201 });
}
