import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const conversationId = params.id;

  const isMember = await prisma.conversationMember.findFirst({
    where: { conversationId, userId },
  });

  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(messages, { status: 201 });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const conversationId = params.id;
  const { content } = await req.json();

  if (!content || !content.trim()) {
    return NextResponse.json(
      { error: "Message cannot be empty" },
      { status: 400 }
    );
  }

  const isMember = await prisma.conversationMember.findFirst({
    where: {
      conversationId,
      userId,
    },
  });

  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
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

  return NextResponse.json(message, { status: 201 });

  
}
