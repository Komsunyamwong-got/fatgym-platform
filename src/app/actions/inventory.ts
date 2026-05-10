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
