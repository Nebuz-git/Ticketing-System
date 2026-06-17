import { prisma } from "../extensions/prisma";
import { AuditAction } from "@prisma/client";

export const createAuditLog = async ({
    userId,
    ticketId,
    action,
    description,
  }: {
    userId: string;
    ticketId?: string;
    action: AuditAction;
    description?: string;
  }) => {
    return prisma.auditLog.create({
      data: {
        userId,
        ticketId,
        action,
        description,
      },
    });
  };