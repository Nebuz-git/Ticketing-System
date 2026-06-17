import { Request, Response } from "express";
import { prisma } from "../extensions/prisma";

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count(),
    ]);

    const formatted = logs.map((log) => ({
      id: log.id,
      action: log.action,
      targetId: log.ticketId,
      details: log.description,
      createdAt: log.createdAt,
      performedBy: log.user,
    }));

    return res.json({
      logs: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};