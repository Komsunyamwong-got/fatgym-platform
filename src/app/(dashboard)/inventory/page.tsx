import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { 
  Plus, 
  Package,
  AlertTriangle,
  History,
  ShoppingCart
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { InventoryForm } from "@/components/inventory/inventory-form";
import { getInventory } from "@/app/actions/inventory";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { cn } from "@/lib/utils";

export default async function InventoryPage() {
  const inventory = await getInventory();
  const lowStockItems = inventory.filter(i => i.quantity <= i.minStock && i.quantity > 0);
  const outOfStockItems = inventory.filter(i => i.quantity === 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Inventory & Stock</h2>
          <p className="text-muted-foreground text-sm">Manage products, equipment, and stock levels.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <History className="w-4 h-4" /> History
          </Button>
          <Dialog>
            <DialogTrigger
              className={cn(buttonVariants({ variant: "default" }), "gap-2 px-4")}
            >
              <Plus className="w-4 h-4" /> Add Item
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <InventoryForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Items</p>
              <p className="text-2xl font-bold">{inventory.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-orange-50 border border-orange-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-orange-800 uppercase tracking-wider">Low Stock</p>
              <p className="text-2xl font-bold text-orange-800">{lowStockItems.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-red-50 border border-red-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Out of Stock</p>
              <p className="text-2xl font-bold text-red-800">{outOfStockItems.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <InventoryTable inventory={inventory} />
    </div>
  );
}
