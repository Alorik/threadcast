import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const threads = await prisma.post.findMany({
    where: {
      type: "THREAD",
      parentId: null, // only top-level threads
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
      media: true, // will be empty, but keeps shape consistent
    },
  });

  return NextResponse.json(threads);
}
