import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({
      message: "Unauthorized",
      status: 400,
    });
  }

  const data = await req.json();
  const { username, bio, avatarUrl } = data;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      username,
      bio,
      avatarUrl,
      onboarded: true
    },
  });

  return NextResponse.json({ success: true, user });
}


export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "User not found" },
      { status: 404 }
    );
  }

  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ user, posts });
}
