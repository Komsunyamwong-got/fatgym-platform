"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPayments() {
  try {
    return await db.payment.findMany({
      include: {
        purchase: {
          include: {
            member: { include: { user: true } },
            membershipPackage: true,
            ptPackage: true,
          }
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return [];
  }
}

export async function createPayment(data: any) {
  try {
    const payment = await db.payment.create({
      data: {
        purchaseId: data.purchaseId,
        amount: data.amount,
        method: data.method,
        status: "PAID",
        receiptNumber: data.receiptNumber,
      },
    });
    revalidatePath("/payments");
    return { success: true, data: payment };
  } catch (error) {
    console.error("Failed to create payment:", error);
    return { success: false, error: "Database error" };
  }
}
