import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../extensions/prisma";

// GET /api/users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/users/support
export const createSupportUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, department } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email, and password are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
        role: "support",
        department: department ?? null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        department: true,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/users/:id/role
export const updateUserRole = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["employee", "support", "admin"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: "role must be employee, support, or admin" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        department: true,
      },
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};