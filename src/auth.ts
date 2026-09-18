import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma as db } from "@/lib/db";
import { checkRateLimit } from "@/lib/security";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
        adminKey: {
          label: "Administrator key",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);
        const adminKey = credentials.adminKey ? String(credentials.adminKey).trim() : "";
        if (!email || password.length < 8 || password.length > 72) return null;

        const requestHeaders = await headers();
        const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          requestHeaders.get("x-real-ip") || "unknown";
        const rateLimit = await checkRateLimit(`login:${email}:${ip}`, 5, 15 * 60 * 1000);
        if (!rateLimit.allowed) return null;

        const user = await db.user.findUnique({ where: { email } });

        if (!user) {
          return null;
        }

        const passwordCorrect = await bcrypt.compare(
          password,
          user.passwordHash
        );

        if (!passwordCorrect) {
          return null;
        }

        if (user.role === "ADMIN") {
          if (!adminKey || !user.adminKeyHash || !(await bcrypt.compare(adminKey, user.adminKeyHash))) {
            return null;
          }
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  jwt: { maxAge: 7 * 24 * 60 * 60 },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});