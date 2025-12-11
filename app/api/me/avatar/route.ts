import { authOptions } from "@/auth/config";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized", status: 401 });
  }

  const { avatarUrl } = await req.json();
  if (!avatarUrl) {
    return NextResponse.json({ error: "Avatar URL missing" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl },
  });

  return NextResponse.json(user, { status: 200 });

}
