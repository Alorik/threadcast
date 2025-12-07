
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import { LoginSchema } from "@/schema/auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextResponse } from "next/server";
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
        // Validate input
        const parsed = LoginSchema.safeParse(credentials);
         if (!parsed.success) {
           return null;
         }

        const { email, password } = parsed.data;

        // Find user
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Check if user exists and has password (not OAuth-only)
        if (!user || !user.password) {
          return null;
        }

        // Check if user has completed onboarding
        if (!user.username) {
        return null;
        }

        // Verify password
       const isValid = await bcrypt.compare(password, user.password);
       if (!isValid) {
         return null;
       }

        // Return user object
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
        token.username = user.username ;
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

    // Handle Google OAuth users without username
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // If user exists but has no username, redirect to onboarding
        if (existingUser && !existingUser.username) {
          return "/onboarding";
        }
      }
      return true;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
};

