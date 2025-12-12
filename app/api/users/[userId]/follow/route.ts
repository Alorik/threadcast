import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized", status: 401 });
  }

  const targetUserId = params.userId;
  const currentUserId = session.user.id;

  if (targetUserId === currentUserId) {
    return NextResponse.json(
      {
        error: "You cannot follow yourself",
      },
      { status: 404 }
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const follow = await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    });
    return NextResponse.json(
      { message: "User followed successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { message: "Already following" },
        { status: 200 }
      );
    }

    console.log("FOLLOW ERR", err);
    return NextResponse.json(
      { error: "Failed to follow user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized", status: 401 });
  }
  const targetUserId = params.userId;
  const currentUserId = session.user.id;

  if (targetUserId === currentUserId) {
    return NextResponse.json(
      { error: "You cannot unfollow yourself" },
      { status: 400 }
    );
  }

  await prisma.follow.deleteMany({
    where: {
      followerId: currentUserId,
      followingId: targetUserId,
    },
  });

  return NextResponse.json({ message: "Unfollowed" }, { status: 200 });
}
