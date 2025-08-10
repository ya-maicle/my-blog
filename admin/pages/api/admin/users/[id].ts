import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return res.status(403).json({ error: "Forbidden" });

  const { id } = req.query as { id: string };

  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return res.status(405).end("Method Not Allowed");
  }

  const body = req.body ?? {};
  const role = body.role as "USER" | "ADMIN" | undefined;
  const isActive = typeof body.isActive === "boolean" ? (body.isActive as boolean) : undefined;

  const data: any = {};
  if (role) {
    if (role !== "USER" && role !== "ADMIN") {
      return res.status(400).json({ error: "Invalid role" });
    }
    data.role = role;
  }
  if (typeof isActive === "boolean") {
    data.isActive = isActive;
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No updates provided" });
  }

  // Prevent removing yourself as the last active admin
  const sessionUserId = (session.user as any).id as string | undefined;
  const isSelf = sessionUserId === id;
  if (isSelf && ((data.role && data.role !== "ADMIN") || data.isActive === false)) {
    const otherAdmins = await prisma.user.count({
      where: { role: "ADMIN", isActive: true, NOT: { id } },
    });
    if (otherAdmins === 0) {
      return res.status(400).json({ error: "Cannot remove the last active admin" });
    }
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return res.status(200).json({ user: updated });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    console.error("[admin][api][users][id] update error", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
