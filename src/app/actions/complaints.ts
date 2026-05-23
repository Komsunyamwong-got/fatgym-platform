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
      include: {
        member: { include: { user: true } },
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
    const complaint = await db.complaint.update({
      where: { id },
      data: { status },
      include: {
        member: { include: { user: true } },
      },
    });
    revalidatePath("/complaints");
    return { success: true, data: complaint };
  } catch (error) {
    console.error("Failed to update complaint status:", error);
    return { success: false };
  }
}

export async function resolveComplaint(id: string, resolution: string) {
  try {
    const complaint = await db.complaint.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolution,
        closedAt: new Date(),
      },
      include: {
        member: { include: { user: true } },
      },
    });
    revalidatePath("/complaints");
    return { success: true, data: complaint };
  } catch (error) {
    console.error("Failed to resolve complaint:", error);
    return { success: false };
  }
}

export async function deleteComplaint(id: string) {
  try {
    await db.complaint.delete({
      where: { id },
    });
    revalidatePath("/complaints");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete complaint:", error);
    return { success: false };
  }
}
