"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getClasses() {
  try {
    return await db.classSchedule.findMany({
      include: {
        trainer: { include: { user: true } },
        _count: { select: { bookings: true } }
      },
      orderBy: { startTime: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    return [];
  }
}

export async function createClass(data: any) {
  try {
    const cls = await db.classSchedule.create({
      data: {
        name: data.name,
        trainerId: data.trainerId,
        capacity: data.capacity,
        startTime: data.startTime,
        endTime: data.endTime,
        category: "Fitness",
      },
    });
    revalidatePath("/classes");
    return { success: true, data: cls };
  } catch (error) {
    console.error("Failed to create class:", error);
    return { success: false };
  }
}

export async function bookClass(memberId: string, classId: string) {
  try {
    await db.classBooking.create({
      data: {
        memberId,
        classId,
        status: "BOOKED",
      },
    });
    revalidatePath("/classes");
    return { success: true };
  } catch (error) {
    console.error("Failed to book class:", error);
    return { success: false, error: "Already booked or class full" };
  }
}
