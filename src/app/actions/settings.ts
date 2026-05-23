"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

const defaultSettings = {
  gymName: "FAT GYM",
  phone: "081-234-5678",
  address: "123 Sukhumvit Road, Bangkok, Thailand",
  language: "English (US)",
  timezone: "(GMT+07:00) Bangkok",
  fullName: "Gym Owner",
  email: "owner@fatgym.com",
  bio: "Founder & Head Coach at FAT GYM."
};

export async function getGymSettings() {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: "global_settings" }
    });

    if (setting) {
      return JSON.parse(setting.value);
    } else {
      // Create defaults in DB
      await db.systemSetting.create({
        data: {
          key: "global_settings",
          value: JSON.stringify(defaultSettings)
        }
      });
      return defaultSettings;
    }
  } catch (error) {
    console.error("Failed to fetch gym settings from DB:", error);
    return defaultSettings;
  }
}

export async function updateGymSettings(data: any) {
  try {
    const current = await getGymSettings();
    const updated = { ...current, ...data };
    
    await db.systemSetting.upsert({
      where: { key: "global_settings" },
      update: { value: JSON.stringify(updated) },
      create: {
        key: "global_settings",
        value: JSON.stringify(updated)
      }
    });

    revalidatePath("/settings");
    return { success: true, settings: updated };
  } catch (error) {
    console.error("Failed to update settings in DB:", error);
    return { success: false };
  }
}
