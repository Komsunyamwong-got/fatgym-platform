"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { MemberStatus, Role } from "@prisma/client";

export async function getMembers() {
  try {
    return await db.member.findMany({
      include: {
        user: true,
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return [];
  }
}

export async function createMember(data: any) {
  try {
    const member = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: "MEMBER",
        memberProfile: {
          create: {
            memberId: data.memberId,
            phone: data.phone,
            status: "ACTIVE",
          },
        },
      },
    });
    revalidatePath("/members");
    return { success: true, data: member };
  } catch (error) {
    console.error("Failed to create member:", error);
    return { success: false, error: "Email or Member ID already exists" };
  }
}

export async function updateMemberStatus(id: string, status: MemberStatus) {
  try {
    await db.member.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/members");
    return { success: true };
  } catch (error) {
    console.error("Failed to update member status:", error);
    return { success: false };
  }
}
