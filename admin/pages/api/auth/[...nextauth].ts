import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user }) {
      // Optional: block inactive users (defaults to allowed if not found)
      try {
        if (user?.id) {
          const db = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isActive: true },
          });
          if (db && db.isActive === false) return false;
        }
      } catch (e) {
        console.error("[Admin][NextAuth][signIn] check failed", e);
      }
      return true;
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id! },
            select: { role: true, isActive: true },
          });
          token.role = dbUser?.role ?? token.role ?? "USER";
        } else if (!token.role && token.sub) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true },
          });
          token.role = dbUser?.role ?? "USER";
        }
      } catch (e) {
        console.error("[Admin][NextAuth][jwt] role load failed", e);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.sub!;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
