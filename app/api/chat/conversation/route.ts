import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { targetUserId} = await req.json();
  const currentUserId = session.user.id;
  
  if (!targetUserId || targetUserId === currentUserId) {
    return NextResponse.json(
      { error: "Invalid Target User" },
      { status: 400 }
    );
  }

  const existingConversation = await prisma.conversation.findFirst({
    where: {
      members: {
        every: {
          userId: { in: [currentUserId, targetUserId] }
        }
      }
    }
  });

  if (existingConversation) {
    return NextResponse.json(existingConversation);
  }

  const conversation = await prisma.conversation.create({
    data: {
      members: {
        createMany: {
          data: [
            { userId: currentUserId },
            { userId: targetUserId },
          ],
        },
      },
    },
  });

  return NextResponse.json(conversation, { status: 201 });
}