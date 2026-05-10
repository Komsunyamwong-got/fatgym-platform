"use client";

import { useState } from "react";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { MoreHorizontal, Package, History, Trash, ArrowUpRight, ArrowDownRight, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InventoryStockControls } from "./stock-controls";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function InventoryTable({ inventory }: { inventory: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInventory = inventory.filter((item) => {
    const searchStr = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchStr) ||
      item.category.toLowerCase().includes(searchStr) ||
      item.id.toLowerCase().includes(searchStr)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 bg-muted/50 border-none" 
            placeholder="Search items by name, category, or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none">Categories</Button>
        </div>
      </div>

      <ResponsiveDataTable
        data={filteredInventory}
        columns={[
          {
            header: "Product Name",
            accessorKey: "name",
            cell: (item: any) => (
              <div className="flex flex-col">
                <span className="font-bold">{item.name}</span>
                <span className="text-xs text-muted-foreground text-[10px]">{item.id}</span>
              </div>
            ),
          },
          {
            header: "Category",
            accessorKey: "category",
            cell: (item: any) => <Badge variant="secondary">{item.category}</Badge>,
          },
          {
            header: "Stock Level",
            accessorKey: "quantity",
            cell: (item: any) => (
              <div className="flex items-center gap-4">
                <span className={cn(
                  "font-bold",
                  item.quantity <= item.minStock ? "text-orange-600" : "text-foreground"
                )}>
                  {item.quantity}
                </span>
                <InventoryStockControls id={item.id} currentStock={item.quantity} />
              </div>
            ),
          },
          {
            header: "Price",
            accessorKey: "sellingPrice",
            cell: (item: any) => <span className="font-bold">฿{item.sellingPrice || 0}</span>,
          },
          {
            header: "Status",
            accessorKey: "quantity",
            cell: (item: any) => {
              const status = item.quantity === 0 ? "OUT_OF_STOCK" : item.quantity <= item.minStock ? "LOW_STOCK" : "IN_STOCK";
              return (
                <Badge 
                  className={cn(
                    "border-none font-bold text-[10px]",
                    status === "IN_STOCK" ? "bg-green-100 text-green-700" : 
                    status === "LOW_STOCK" ? "bg-orange-100 text-orange-700" : 
                    "bg-red-100 text-red-700"
                  )}
                >
                  {status.replace(/_/g, " ")}
                </Badge>
              );
            },
          },
          {
            header: "",
            accessorKey: "id",
            cell: (item: any) => (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Stock Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                      <Package className="w-4 h-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                      <ArrowUpRight className="w-4 h-4" /> Restock
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                      <ArrowDownRight className="w-4 h-4" /> Write-off
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                      <History className="w-4 h-4" /> Stock History
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive flex items-center gap-2 cursor-pointer">
                    <Trash className="w-4 h-4" /> Delete Product
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        mobileRender={(item: any) => {
          const status = item.quantity === 0 ? "OUT_OF_STOCK" : item.quantity <= item.minStock ? "LOW_STOCK" : "IN_STOCK";
          return (
            <div className="p-4 space-y-4 border-b last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <Badge 
                  className={cn(
                    "border-none font-bold text-[10px]",
                    status === "IN_STOCK" ? "bg-green-100 text-green-700" : 
                    status === "LOW_STOCK" ? "bg-orange-100 text-orange-700" : 
                    "bg-red-100 text-red-700"
                  )}
                >
                  {status.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-y">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">Price: <span className="font-bold text-foreground">฿{item.sellingPrice}</span></span>
                  <span className="text-xs text-muted-foreground">Stock: <span className="font-bold text-foreground">{item.quantity}</span></span>
                </div>
                <InventoryStockControls id={item.id} currentStock={item.quantity} />
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
