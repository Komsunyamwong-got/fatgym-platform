import { InventoryClient } from "@/components/inventory/inventory-client";
import { getInventory, getInventoryTransactions } from "@/app/actions/inventory";

export default async function InventoryPage() {
  const inventory = await getInventory();
  const transactions = await getInventoryTransactions();

  return (
    <InventoryClient initialInventory={inventory} initialTransactions={transactions} />
  );
}
