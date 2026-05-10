"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveOnboarding(memberId: string, data: any) {
  try {
    const { goals, parq, nutrition, measurements } = data;

    // Use a transaction to ensure all data is saved
    await db.$transaction([
      // Goals
      db.goal.create({
        data: {
          memberId,
          mainGoal: goals.mainGoal,
          targetValue: goals.targetValue,
          targetDate: new Date(goals.targetDate),
        },
      }),
      // PAR-Q Health Screening
      db.healthScreening.upsert({
        where: { memberId },
        update: { data: parq },
        create: { memberId, data: parq },
      }),
      // Nutrition
      db.nutritionProfile.upsert({
        where: { memberId },
        update: {
          calories: parseInt(nutrition.calories),
          protein: parseInt(nutrition.protein),
          carbs: parseInt(nutrition.carbs),
        },
        create: {
          memberId,
          calories: parseInt(nutrition.calories),
          protein: parseInt(nutrition.protein),
          carbs: parseInt(nutrition.carbs),
        },
      }),
      // Measurements
      db.measurement.create({
        data: {
          memberId,
          weight: parseFloat(measurements.weight),
          bmi: parseFloat(measurements.bmi),
          bodyFat: parseFloat(measurements.bodyFat),
          chest: parseFloat(measurements.chest),
          waist: parseFloat(measurements.waist),
          hips: parseFloat(measurements.hips),
        },
      }),
    ]);

    revalidatePath(`/members/${memberId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to save onboarding data:", error);
    return { success: false, error: "Database error" };
  }
}
