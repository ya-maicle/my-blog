import { getServerSession } from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export function getServerAuthSession(req: NextApiRequest, res: NextApiResponse) {
  return getServerSession(req, res, authOptions);
}

export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerAuthSession(req, res);
  const role = (session?.user as any)?.role;
  if (!session || role !== "ADMIN") {
    return null;
  }
  return session;
}
