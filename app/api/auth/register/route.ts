import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { RegisterSchema } from "@/schema/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        message: "INVALID INPUT",
        status: 400,
      });
    }

    const { email, username, password } = parsed.data;
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, username, password: hashed, onboarded: false },
    });
    return NextResponse.json(
      { id: user.id, message: "User created successfully" },
      { status: 201 }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}