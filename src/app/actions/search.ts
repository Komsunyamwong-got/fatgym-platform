"use server";

import db from "@/lib/db";

export async function globalSearch(query: string) {
  if (!query || query.length < 2) return { members: [], trainers: [], inventory: [], programs: [], payments: [] };

  const [members, trainers, inventory, programs, payments] = await Promise.all([
    // Search Members
    db.member.findMany({
      where: {
        OR: [
          { user: { name: { contains: query } } },
          { memberId: { contains: query } },
          { phone: { contains: query } },
        ],
      },
      include: { user: true },
      take: 5,
    }),
    // Search Trainers
    db.trainer.findMany({
      where: {
        OR: [
          { user: { name: { contains: query } } },
          { trainerId: { contains: query } },
          { phone: { contains: query } },
          { specialty: { contains: query } },
        ],
      },
      include: { user: true },
      take: 5,
    }),
    // Search Inventory
    db.inventoryItem.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { category: { contains: query } },
        ],
      },
      take: 5,
    }),
    // Search Programs
    db.trainingProgram.findMany({
      where: {
        name: { contains: query },
      },
      take: 5,
    }),
    // Search Payments
    db.payment.findMany({
      where: {
        receiptNumber: { contains: query },
      },
      take: 5,
    }),
  ]);

  return { members, trainers, inventory, programs, payments };
}
