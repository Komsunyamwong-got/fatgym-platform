"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getInventory() {
  try {
    return await db.inventoryItem.findMany({
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return [];
  }
}

export async function createInventoryItem(data: any) {
  try {
    const item = await db.inventoryItem.create({
      data: {
        name: data.name,
        category: data.category,
        quantity: data.quantity,
        sellingPrice: data.sellingPrice,
        minStock: 5, // Default min stock
      },
    });
    revalidatePath("/inventory");
    return { success: true, data: item };
  } catch (error) {
    console.error("Failed to create inventory item:", error);
    return { success: false, error: "Database error" };
  }
}

export async function updateStock(id: string, quantity: number, type: "IN" | "OUT") {
  try {
    await db.$transaction([
      db.inventoryItem.update({
        where: { id },
        data: {
          quantity: {
            increment: type === "IN" ? quantity : -quantity,
          },
        },
      }),
      db.inventoryTransaction.create({
        data: {
          itemId: id,
          type,
          quantity,
        },
      }),
    ]);
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Failed to update stock:", error);
    return { success: false };
  }
}

export async function getInventoryTransactions() {
  try {
    return await db.inventoryTransaction.findMany({
      include: {
        item: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

export async function deleteInventoryItem(id: string) {
  try {
    // Delete any transactions referencing this item first
    await db.inventoryTransaction.deleteMany({
      where: { itemId: id },
    });
    
    await db.inventoryItem.delete({
      where: { id },
    });
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete inventory item:", error);
    return { success: false, error: "Database error" };
  }
}

export async function recordStockAction(data: { itemId: string; quantity: number; type: "IN" | "OUT" | "DAMAGED"; notes?: string }) {
  try {
    const transaction = await db.$transaction(async (tx) => {
      // 1. Update item stock quantity
      const item = await tx.inventoryItem.update({
        where: { id: data.itemId },
        data: {
          quantity: {
            increment: data.type === "IN" ? data.quantity : -data.quantity,
          },
        },
      });

      // 2. Create the stock transaction record
      const trans = await tx.inventoryTransaction.create({
        data: {
          itemId: data.itemId,
          type: data.type,
          quantity: data.quantity,
          notes: data.notes || null,
        },
        include: {
          item: true,
        }
      });

      return { item, transaction: trans };
    });

    revalidatePath("/inventory");
    return { success: true, data: transaction };
  } catch (error) {
    console.error("Failed to record stock action:", error);
    return { success: false, error: "Database error" };
  }
}
