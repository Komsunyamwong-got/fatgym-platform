"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addTrainer(data: {
  name: string;
  email: string;
  phone?: string;
  level?: string;
  specialty?: string;
}) {
  try {
    const trainerCount = await db.trainer.count();
    const trainerId = `T-${new Date().getFullYear()}-${String(trainerCount + 1).padStart(3, "0")}`;

    // Create user and trainer in a transaction
    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          role: "TRAINER",
        },
      });

      await tx.trainer.create({
        data: {
          userId: user.id,
          trainerId,
          phone: data.phone,
          level: data.level,
          specialty: data.specialty,
          status: "ACTIVE",
        },
      });
    });

    revalidatePath("/trainers");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add trainer:", error);
    return { success: false, error: error.message || "Failed to add trainer" };
  }
}

export async function deleteTrainer(trainerId: string) {
  try {
    const trainer = await db.trainer.findUnique({
      where: { id: trainerId },
    });

    if (!trainer) {
      return { success: false, error: "Trainer not found" };
    }

    // Cascade delete is defined in Prisma so deleting the User will delete the Trainer!
    await db.user.delete({
      where: { id: trainer.userId },
    });

    revalidatePath("/trainers");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete trainer:", error);
    return { success: false, error: error.message || "Failed to delete trainer" };
  }
}
