"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PTStatus } from "@prisma/client";

export async function getPTSessions() {
  try {
    return await db.pTSession.findMany({
      include: {
        member: {
          include: {
            user: true,
          },
        },
        trainer: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch PT sessions:", error);
    return [];
  }
}

export async function updateSessionStatus(id: string, status: PTStatus) {
  try {
    await db.pTSession.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/pt-sessions");
    return { success: true };
  } catch (error) {
    console.error("Failed to update session status:", error);
    return { success: false };
  }
}

export async function bookSession(data: any) {
  try {
    const session = await db.pTSession.create({
      data: {
        memberId: data.memberId,
        trainerId: data.trainerId,
        date: new Date(data.date),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: "PENDING_CONFIRMATION",
      },
    });
    revalidatePath("/pt-sessions");
    revalidatePath("/schedule");
    return { success: true, data: session };
  } catch (error) {
    console.error("Failed to book session:", error);
    return { success: false };
  }
}
