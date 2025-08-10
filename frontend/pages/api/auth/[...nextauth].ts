import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { ensureInWelcomeGroup } from "@/lib/mailerLite";

if (process.env.NODE_ENV === "development") {
  // Basic env presence check for easier debugging in dev
  console.log("[NextAuth] env check", {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: Boolean(process.env.NEXTAUTH_SECRET),
    GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET),
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  // Explicitly set secret + enable debug logs in dev
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  events: {
    async createUser({ user }) {
      try {
        if (process.env.NODE_ENV === "development") {
          console.log("[NextAuth][events.createUser] ensure for", user.email);
        }
        if (user.email) {
          await ensureInWelcomeGroup({
            email: user.email,
            name: user.name ?? undefined,
          });
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { welcomedAt: new Date() },
        });
      } catch (err) {
        console.error("[NextAuth][events.createUser] error", err);
      }
    },
  },
  callbacks: {
    async signIn({ user }) {
      try {
        // Make MailerLite call first using the best email we have,
        // so a failed DB lookup doesn't skip the subscription.
        const primaryEmail = user.email ?? undefined;
        const primaryName = user.name ?? undefined;

        if (process.env.NODE_ENV === "development") {
          console.log("[NextAuth][callbacks.signIn] ensure for", primaryEmail);
        }

        if (primaryEmail) {
          await ensureInWelcomeGroup({ email: primaryEmail, name: primaryName });
        }

        // Safely fetch db user: try by id if present, else by email.
        let dbUser: { welcomedAt: Date | null; email: string | null } | null = null;
        if (user.id) {
          dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { welcomedAt: true, email: true },
          });
        } else if (primaryEmail) {
          dbUser = await prisma.user.findUnique({
            where: { email: primaryEmail },
            select: { welcomedAt: true, email: true },
          });
        }

        // Only stamp welcomedAt after successful ensure.
        if (dbUser && !dbUser.welcomedAt && dbUser.email) {
          await prisma.user.update({
            where: { email: dbUser.email },
            data: { welcomedAt: new Date() },
          });
        }
      } catch (err) {
        console.error("[NextAuth][callbacks.signIn] error", err);
      }
      return true;
    },
  },
};

export default NextAuth(authOptions);
