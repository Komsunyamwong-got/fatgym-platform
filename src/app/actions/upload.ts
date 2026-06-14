"use server";

import { revalidatePath } from "next/cache";
import { updateGymSettings } from "./settings";

export async function uploadLogo(formData: FormData) {
  try {
    const file = formData.get("logo") as File;
    if (!file) return { success: false, error: "No file provided" };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert to Base64 to store directly in the database without file system dependencies
    const mimeType = file.type || "image/png";
    const base64String = `data:${mimeType};base64,${buffer.toString("base64")}`;

    // Save to database settings
    await updateGymSettings({ logoUrl: base64String });

    revalidatePath("/settings");
    return { success: true, url: base64String };
  } catch (error) {
    console.error("Failed to upload logo to database:", error);
    return { success: false, error: "Failed to save file to database" };
  }
}

import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function uploadAvatar(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const file = formData.get("avatar") as File;
    if (!file) return { success: false, error: "No file provided" };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert to Base64 to store directly in the database without file system dependencies
    const mimeType = file.type || "image/png";
    const base64String = `data:${mimeType};base64,${buffer.toString("base64")}`;

    // Save to User database
    await db.user.update({
      where: { id: session.user.id },
      data: { image: base64String }
    });

    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true, url: base64String };
  } catch (error) {
    console.error("Failed to upload avatar to database:", error);
    return { success: false, error: "Failed to save file to database" };
  }
}

