import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const threads = await prisma.post.findMany({
    where: {
      type: "THREAD",
      parentId: null,
    },

    orderBy: {
      createdAt: "desc",
    },
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

  return NextResponse.json(threads, { status: 201 });
}
