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

export async function deleteMember(memberId: string) {
  try {
    const member = await db.member.findUnique({
      where: { id: memberId },
      include: { purchases: true }
    });
    
    if (member) {
      const purchaseIds = member.purchases.map(p => p.id);

      // Manually delete related records to prevent foreign key constraint errors
      await db.$transaction([
        db.payment.deleteMany({
          where: { purchaseId: { in: purchaseIds } }
        }),
        db.purchase.deleteMany({ where: { memberId } }),
        db.checkIn.deleteMany({ where: { memberId } }),
        db.classBooking.deleteMany({ where: { memberId } }),
        db.complaint.deleteMany({ where: { memberId } }),
        db.goal.deleteMany({ where: { memberId } }),
        db.measurement.deleteMany({ where: { memberId } }),
        db.clientTrainingPlan.deleteMany({ where: { memberId } }),
        db.pTSession.deleteMany({ where: { memberId } }),
        db.healthScreening.deleteMany({ where: { memberId } }),
        db.postureAssessment.deleteMany({ where: { memberId } }),
        db.nutritionProfile.deleteMany({ where: { memberId } }),
        
        // Deleting the User will cascade delete the Member profile
        db.user.delete({
          where: { id: member.userId },
        })
      ]);
      
      revalidatePath("/members");
      return { success: true };
    }
    return { success: false, error: "Member not found" };
  } catch (error) {
    console.error("Failed to delete member:", error);
    return { success: false, error: "Failed to delete member" };
  }
}

export async function recordAttendance(memberId: string) {
  try {
    await db.checkIn.create({
      data: {
        memberId,
        type: "GYM",
      },
    });
    revalidatePath("/members");
    return { success: true };
  } catch (error) {
    console.error("Failed to record attendance:", error);
    return { success: false, error: "Failed to record attendance" };
  }
}

export async function extendMembership(memberId: string, monthsToAdd: number) {
  try {
    const member = await db.member.findUnique({
      where: { id: memberId },
    });
    
    if (!member) {
      return { success: false, error: "Member not found" };
    }

    const currentExpiry = member.expiryDate || new Date();
    // If the membership is already expired, start from today
    const baseDate = currentExpiry < new Date() ? new Date() : currentExpiry;
    
    const newExpiry = new Date(baseDate);
    newExpiry.setMonth(newExpiry.getMonth() + monthsToAdd);

    await db.member.update({
      where: { id: memberId },
      data: { 
        expiryDate: newExpiry,
        status: "ACTIVE" // automatically set status to active if they renew
      },
    });
    
    revalidatePath("/members");
    return { success: true };
  } catch (error) {
    console.error("Failed to extend membership:", error);
    return { success: false, error: "Failed to extend membership" };
  }
}
