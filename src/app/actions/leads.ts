"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { LeadStatus } from "@prisma/client";

export async function getLeads() {
  try {
    return await db.lead.findMany({
      include: {
        followUps: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return [];
  }
}

export async function createLead(data: any) {
  try {
    const lead = await db.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        source: data.source,
        interest: data.interest,
        status: "NEW_LEAD",
      },
    });
    revalidatePath("/leads");
    return { success: true, data: lead };
  } catch (error) {
    console.error("Failed to create lead:", error);
    return { success: false, error: "Database error" };
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  try {
    await db.lead.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/leads");
    return { success: true };
  } catch (error) {
    console.error("Failed to update lead status:", error);
    return { success: false };
  }
}
