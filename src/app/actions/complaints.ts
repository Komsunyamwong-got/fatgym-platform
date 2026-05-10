"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ComplaintStatus } from "@prisma/client";

export async function getComplaints() {
  try {
    return await db.complaint.findMany({
      include: {
        member: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch complaints:", error);
    return [];
  }
}

export async function createComplaint(data: any) {
  try {
    const complaint = await db.complaint.create({
      data: {
        memberId: data.memberId,
        type: data.type,
        description: data.description,
        status: "OPEN",
      },
    });
    revalidatePath("/complaints");
    return { success: true, data: complaint };
  } catch (error) {
    console.error("Failed to create complaint:", error);
    return { success: false };
  }
}

export async function updateComplaintStatus(id: string, status: ComplaintStatus) {
  try {
    await db.complaint.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/complaints");
    return { success: true };
  } catch (error) {
    console.error("Failed to update complaint status:", error);
    return { success: false };
  }
}
