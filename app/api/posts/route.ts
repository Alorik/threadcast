import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { CreatePostSchema } from "@/schema/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });
  return Response.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthenticated", status: 400 });
  }

  const data = await req.json();
  const parsed = CreatePostSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid Data" }, { status: 400 });
  }

  const { content } = parsed.data;
  const post = await prisma.post.create({
    data: {
      content,
      userId: session.user.id,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
