import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../extensions/prisma";
import { createAuditLog } from "../utils/createAuditLog";


const validPriorities = ["low", "medium", "high"];
const validStatuses = ["open", "in_progress", "resolved", "closed"];


export const getTickets = async (req: Request , res: Response) => {
try {
    const {status , priority , search} = req.query;

    const user = (req as any).user

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // validation
    if (priority && !validPriorities.includes(priority as string)) {
        return res.status(400).json({
          message: "priority filter must be low, medium, or high",
        });
      }
      
      if (status && !validStatuses.includes(status as string)) {
        return res.status(400).json({
          message: "status filter must be open, in_progress, resolved, or closed",
        });
      }

       // shared where clause (important for reuse)
    const whereClause: Prisma.TicketWhereInput = {
      ...(user.role === "employee" ? { createdBy: user.userId } : {}),
      ...(priority ? { priority: priority as any } : {}),
      ...(status ? { status: status as any } : {}),
      ...(search
        ? {
            title: {
              contains: search as string,
              mode: "insensitive",
            },
          }
        : {}),
    };

    // employees only see their own tickets
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              department: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.ticket.count({
        where: whereClause,
      }),
    ]);
    return res.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

// detail view must enforce the same ownership rule as list view.
export const getTicketById = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const user = (req as any).user;
  
      const ticket = await prisma.ticket.findUnique({
        where: { id: req.params.id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              department: true,
            },
          },
        },
      });
  
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
  
      if (user.role === "employee" && ticket.createdBy !== user.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
  
      return res.json(ticket);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  };

  // CREATE TICKET
  export const createTicket = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { title, description, priority} = req.body;
      const user = (req as any).user;
  
      if (!title || !description) {
        return res.status(400).json({
          message: "title and description are required",
        });
      }

      if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({
          message: "priority must be low, medium, or high",
        });
      }
  
      const ticket = await prisma.ticket.create({
        data: {
          title,
          description,
          priority: priority || "medium",
          createdBy: user.userId,
        },
      });

      await createAuditLog({
        userId: user.userId,
        ticketId: ticket.id,
        action: "TICKET_CREATED",
        description: `Created ticket "${title}" with priority ${priority}`,
      });
  
      return res.status(201).json(ticket);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  };

// UPDATE TICKET
  export const updateTicket = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { title, description, priority, status } = req.body;

    if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({
          message: "priority must be low, medium, or high",
        });
      }
      
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          message: "status must be open, in_progress, resolved, or closed",
        });
      }

    const user = (req as any).user;

    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (user.role === "employee" && ticket.createdBy !== user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const changedFields = [
      title !== undefined && title !== ticket.title ? "title" : null,
      description !== undefined && description !== ticket.description ? "description" : null,
      priority !== undefined && priority !== ticket.priority ? "priority" : null,
      status !== undefined && status !== ticket.status ? "status" : null,
    ].filter((field): field is string => field !== null);

    const updatedTicket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        priority,
        status,
      },
    });

    await createAuditLog({
      userId: user.userId,
      ticketId: ticket.id,
      action: "TICKET_UPDATED",
      description:
        changedFields.length > 0
          ? `Updated ${changedFields.join(", ")} in "${updatedTicket.title}"`
          : `Updated ticket "${updatedTicket.title}"`,
    });
    return res.json(updatedTicket);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE TICKET
  export const deleteTicket = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const user = (req as any).user;
  
      const ticket = await prisma.ticket.findUnique({
        where: { id: req.params.id },
      });
  
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
  
      if (user.role === "employee" && ticket.createdBy !== user.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
  
      await createAuditLog({
        userId: user.userId,
        ticketId: ticket.id,
        action: "TICKET_DELETED",
        description: `Deleted ticket "${ticket.title}" (ID: ${ticket.id})`,
      });

      await prisma.ticket.delete({
        where: { id: req.params.id },
      });

  
      return res.json({ message: "Ticket deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  };

  export const getDashboardStats = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
  
      const where = user.role === "employee" ? { createdBy: user.userId } : {};
  
      const [total, open, inProgress, resolved, closed, recentTickets] =
        await Promise.all([
          prisma.ticket.count({ where }),
          prisma.ticket.count({ where: { ...where, status: "open" } }),
          prisma.ticket.count({ where: { ...where, status: "in_progress" } }),
          prisma.ticket.count({ where: { ...where, status: "resolved" } }),
          prisma.ticket.count({ where: { ...where, status: "closed" } }),
          prisma.ticket.findMany({
            where,
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  department: true,
                },
              },
            },
          }),
        ]);
  
      return res.json({
        total,
        open,
        in_progress: inProgress,
        resolved,
        closed,
        recentTickets,
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  };
