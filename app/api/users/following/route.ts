import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";



export async function GET() {
  const session = await getServerSession(authOptions);

if(!session){
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
  
  const following = await prisma.follow.findMany({
    where: {
      followerId: session.user.id,
    },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });
  return NextResponse.json(following.map((f) => f.following));
}