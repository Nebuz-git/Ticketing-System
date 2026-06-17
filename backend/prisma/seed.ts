import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("Demo123!", 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@ticketsys.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@ticketsys.com",
      password: hashedPassword,
      role: "admin",
      department: "IT",
    },
  });

  // Support
  const support = await prisma.user.upsert({
    where: { email: "support@ticketsys.com" },
    update: {},
    create: {
      username: "support",
      email: "support@ticketsys.com",
      password: hashedPassword,
      role: "support",
      department: "Support",
    },
  });

  // Employee
  const employee = await prisma.user.upsert({
    where: { email: "employee@ticketsys.com" },
    update: {},
    create: {
      username: "employee",
      email: "employee@ticketsys.com",
      password: hashedPassword,
      role: "employee",
      department: "Engineering",
    },
  });

  // Demo tickets
  const ticket1 = await prisma.ticket.upsert({
    where: { id: "seed-ticket-1" },
    update: {},
    create: {
      id: "seed-ticket-1",
      title: "Cannot access the VPN",
      description: "I am unable to connect to the company VPN since this morning. I have tried restarting but the issue persists.",
      priority: "high",
      status: "open",
      createdBy: employee.id,
    },
  });

  const ticket2 = await prisma.ticket.upsert({
    where: { id: "seed-ticket-2" },
    update: {},
    create: {
      id: "seed-ticket-2",
      title: "Email client crashing on startup",
      description: "Outlook crashes every time I try to open it. This started after the latest Windows update.",
      priority: "medium",
      status: "in_progress",
      createdBy: employee.id,
    },
  });

  const ticket3 = await prisma.ticket.upsert({
    where: { id: "seed-ticket-3" },
    update: {},
    create: {
      id: "seed-ticket-3",
      title: "Request for additional monitor",
      description: "I would like to request a second monitor for my workstation to improve productivity.",
      priority: "low",
      status: "resolved",
      createdBy: employee.id,
    },
  });

  // Demo audit logs
  await prisma.auditLog.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: employee.id,
        ticketId: ticket1.id,
        action: "TICKET_CREATED",
        description: `Created ticket "Cannot access the VPN" with priority high`,
      },
      {
        userId: employee.id,
        ticketId: ticket2.id,
        action: "TICKET_CREATED",
        description: `Created ticket "Email client crashing on startup" with priority medium`,
      },
      {
        userId: support.id,
        ticketId: ticket2.id,
        action: "TICKET_UPDATED",
        description: `Updated status in "Email client crashing on startup"`,
      },
      {
        userId: support.id,
        ticketId: ticket3.id,
        action: "TICKET_UPDATED",
        description: `Updated status in "Request for additional monitor"`,
      },
      {
        userId: admin.id,
        ticketId: null,
        action: "SUPPORT_CREATED",
        description: `Email: support@ticketsys.com`,
      },
    ],
  });

  console.log("✅ Seed complete:");
  console.log("   admin@ticketsys.com    / Demo123!");
  console.log("   support@ticketsys.com  / Demo123!");
  console.log("   employee@ticketsys.com / Demo123!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });