"use server";

import db from "@/lib/db";

export async function getSelectionLists() {
  const members = await db.member.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } }
  });
  
  const trainers = await db.trainer.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } }
  });

  return { members, trainers };
}
