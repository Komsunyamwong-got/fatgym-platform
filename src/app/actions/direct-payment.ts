"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function recordDirectPayment(data: any) {
  try {
    const transaction = await db.$transaction(async (tx) => {
      // Create a standalone purchase first
      const purchase = await tx.purchase.create({
        data: {
          memberId: data.memberId,
          amount: data.amount,
        },
      });

      // Then create the payment record
      const payment = await tx.payment.create({
        data: {
          purchaseId: purchase.id,
          amount: data.amount,
          method: data.method,
          status: "PAID",
          receiptNumber: `REC-${Date.now()}`,
        },
        include: {
          purchase: {
            include: {
              member: { include: { user: true } },
              membershipPackage: true,
              ptPackage: true,
            }
          }
        }
      });

      return payment;
    });

    revalidatePath("/payments");
    return { success: true, data: transaction };
  } catch (error) {
    console.error("Failed to record payment:", error);
    return { success: false };
  }
}
