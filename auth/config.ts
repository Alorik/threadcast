import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import { LoginSchema } from "@/schema/auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: "select_account" } },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔥 AUTHORIZE CALLED 🔥", credentials);

        // Validate input
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          console.log("❌ Validation failed");
          return null;
        }

        const { email, password } = parsed.data;

        // Find user
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          console.log("❌ User not found or no password");
          return null;
        }

        if (!user.username) {
          console.log("❌ User has no username");
          return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          console.log("❌ Invalid password");
          return null;
        }

        console.log("✅ User authenticated successfully");
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? "";
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
      }
      return session;
    },
    async signIn({ user }) {

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: {
            username: true,
          },
        });

        if (existingUser && !existingUser.username) {
          return "/onboarding";
        }

      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/onboarding",
  },
};
