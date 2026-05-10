"use server";

import { writeFile } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";

export async function uploadLogo(formData: FormData) {
  try {
    const file = formData.get("logo") as File;
    if (!file) return { success: false, error: "No file provided" };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const path = join(process.cwd(), "public", "uploads", "gym-logo.png");
    await writeFile(path, buffer);

    revalidatePath("/settings");
    return { success: true, url: "/uploads/gym-logo.png" };
  } catch (error) {
    console.error("Failed to upload logo:", error);
    return { success: false, error: "Failed to save file" };
  }
}
