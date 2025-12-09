import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> } // ✅ params is now a Promise
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized", status: 401 });
  }

  const { postId } = await params;
  try {
    const like = await prisma.like.create({
      data: {
        postId,
        userId: session.user.id,
      },
    });
    return Response.json(like, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return Response.json({ message: "Already liked" }, { status: 200 });
    }
    console.log(err);
    return NextResponse.json(
      { error: "Failed to like the post" },
      { status: 401 }
    );
  }
}

//unlike

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> } // ✅ params is a Promise
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({
      message: "Unauthorized",
      status: 401,
    });
  }

  const { postId } = await params;

  await prisma.like.deleteMany({
    where: {
      postId,
      userId: session.user.id,
    },
  });
}
