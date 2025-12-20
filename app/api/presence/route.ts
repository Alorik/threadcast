import { authOptions } from "@/auth/config";
import { pusherServer } from "@/lib/pusher-server";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";



export async function POST(){
  const session = await getServerSession(authOptions);
  if(!session){
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  await pusherServer.trigger("presence", "user-online", {
    userId,
  });

  return NextResponse.json({ sucess: 201 });
}