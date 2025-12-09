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

  if (!session?.user) {
    return Response.json({ user: null }, { status: 200 });
  }

  return Response.json({ user: session.user });
}