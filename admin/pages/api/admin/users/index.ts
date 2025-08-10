import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return res.status(403).json({ error: "Forbidden" });

  if (req.method === "GET") {
    const { query = "", page = "1", size = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(size), 10) || 20));
    const where =
      query && String(query).trim().length > 0
        ? {
            OR: [
              { email: { contains: String(query) } },
              { name: { contains: String(query) } },
            ],
          }
        : {};
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { email: "asc" },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        select: { id: true, name: true, email: true, role: true, isActive: true },
      }),
    ]);
    return res.status(200).json({ total, users, page: pageNum, size: pageSize });
  }

  res.setHeader("Allow", "GET");
  return res.status(405).end("Method Not Allowed");
}
