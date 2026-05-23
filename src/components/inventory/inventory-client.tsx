"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter,
  History as HistoryIcon,
  Package,
  AlertTriangle,
  ShoppingCart,
  MoreHorizontal,
  ChevronRight,
  Printer,
  X,
  FileText,
  TrendingUp,
  Trash,
  ArrowUpRight,
  ArrowDownRight,
  Bookmark,
  Calendar,
  Layers,
  Wrench,
  CheckCircle2,
  Info
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InventoryForm } from "@/components/inventory/inventory-form";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { recordStockAction, deleteInventoryItem } from "@/app/actions/inventory";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InventoryClientProps {
  initialInventory: any[];
  initialTransactions: any[];
}

export function InventoryClient({ initialInventory, initialTransactions }: InventoryClientProps) {
  const [inventoryList, setInventoryList] = useState<any[]>(initialInventory);
  const [transactionsList, setTransactionsList] = useState<any[]>(initialTransactions);
  
  // Controls & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"list" | "categories">("list");

  // Dialog / Action Modals state
  const [activeItem, setActiveItem] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<"details" | "restock" | "writeoff" | "history" | "delete" | null>(null);
  
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isGlobalHistoryOpen, setIsGlobalHistoryOpen] = useState(false);

  // Form input states
  const [quantityInput, setQuantityInput] = useState<string>("10");
  const [notesInput, setNotesInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Re-calculate KPI stocks dynamically
  const totalItems = inventoryList.length;
  const lowStockItems = inventoryList.filter(i => i.quantity <= i.minStock && i.quantity > 0).length;
  const outOfStockItems = inventoryList.filter(i => i.quantity === 0).length;

  // Filtered inventory items
  const filteredInventory = inventoryList.filter(item => {
    const searchStr = searchQuery.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(searchStr) ||
      (item.category && item.category.toLowerCase().includes(searchStr)) ||
      item.id.toLowerCase().includes(searchStr);

    let matchesStatus = true;
    if (selectedStatus === "LOW_STOCK") {
      matchesStatus = item.quantity <= item.minStock && item.quantity > 0;
    } else if (selectedStatus === "OUT_OF_STOCK") {
      matchesStatus = item.quantity === 0;
    } else if (selectedStatus === "IN_STOCK") {
      matchesStatus = item.quantity > item.minStock;
    }

    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Unique categories helper
  const uniqueCategories = Array.from(new Set(inventoryList.map(i => i.category).filter(Boolean)));

  // Strict English Date Formatting (Gregorian)
  const formatEnglishDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Restock & Write-off handler
  const handleStockAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !quantityInput) return;

    const qty = parseInt(quantityInput);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid quantity amount");
      return;
    }

    const actionType = dialogMode === "restock" ? "IN" : "OUT";
    setIsSubmitting(true);

    const res = await recordStockAction({
      itemId: activeItem.id,
      quantity: qty,
      type: actionType,
      notes: notesInput.trim() || undefined
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      const { item, transaction } = res.data;
      
      // Update local state instantly
      setInventoryList(prev => prev.map(i => i.id === item.id ? item : i));
      setTransactionsList(prev => [transaction, ...prev]);

      toast.success(actionType === "IN" 
        ? `Successfully restocked ${qty} units of ${item.name}!`
        : `Successfully wrote-off ${qty} units of ${item.name}!`
      );
      
      // Close modal
      setDialogMode(null);
      setActiveItem(null);
      setQuantityInput("10");
      setNotesInput("");
    } else {
      toast.error("Failed to update product stock");
    }
  };

  // Delete product handler
  const handleDeleteProduct = async () => {
    if (!activeItem) return;

    setIsSubmitting(true);
    const res = await deleteInventoryItem(activeItem.id);
    setIsSubmitting(false);

    if (res.success) {
      setInventoryList(prev => prev.filter(i => i.id !== activeItem.id));
      toast.success("Product deleted successfully");
      setDialogMode(null);
      setActiveItem(null);
    } else {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header section circled by user */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Inventory & Stock</h2>
          <p className="text-muted-foreground text-sm">Manage products, equipment, and stock levels.</p>
        </div>
        <div className="flex gap-2">
          
          {/* Stock History Audit Log Trigger */}
          <Button 
            variant="outline" 
            className="gap-2 font-semibold hover:scale-105 active:scale-95 transition-all"
            onClick={() => setIsGlobalHistoryOpen(true)}
          >
            <HistoryIcon className="w-4 h-4" /> History
          </Button>

          {/* Add New Product Trigger */}
          <Dialog open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
            <DialogTrigger
              render={
                <Button className="gap-2 font-semibold hover:scale-105 active:scale-95 transition-all shadow-sm">
                  <Plus className="w-4 h-4" /> Add Item
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Create a new stock item. All validation is in English.</DialogDescription>
              </DialogHeader>
              {/* Supply callback to sync inventory list on add success */}
              <InventoryForm onSuccess={(newItem: any) => {
                setInventoryList(prev => [...prev, newItem]);
                setIsNewItemOpen(false);
                toast.success(`Successfully added ${newItem.name}!`);
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI stock stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Package className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Items</p>
              <p className="text-2xl font-black text-zinc-900">{totalItems}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-amber-50 border border-amber-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Low Stock</p>
              <p className="text-2xl font-black text-amber-800">{lowStockItems}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-red-50 border border-red-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <ShoppingCart className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Out of Stock</p>
              <p className="text-2xl font-black text-red-800">{outOfStockItems}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter / Category bar circled by user */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
        
        {/* Real-time search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-none font-medium text-zinc-800 placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary" 
            placeholder="Search items by name, category, or ID..." 
          />
        </div>

        {/* Action button triggers */}
        <div className="flex gap-2 w-full md:w-auto">
          
          {/* Advanced Filters Popover */}
          <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <DialogTrigger
              render={
                <Button 
                  variant="outline" 
                  className={cn(
                    "flex-1 md:flex-none gap-2 font-semibold transition-all",
                    (selectedStatus !== "ALL" || selectedCategory !== "ALL") && "border-primary bg-primary/5 text-primary"
                  )}
                >
                  <Filter className="w-4 h-4" /> Filters
                </Button>
              }
            />
            <DialogContent className="sm:max-w-xs">
              <DialogHeader>
                <DialogTitle>Filter Stock</DialogTitle>
                <DialogDescription>Filter items by availability status or category list.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Availability Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="ALL">All Items</option>
                    <option value="IN_STOCK">In Stock</option>
                    <option value="LOW_STOCK">Low Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Acquisition Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="ALL">All Categories</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="secondary" 
                  className="w-full text-xs font-bold"
                  onClick={() => {
                    setSelectedStatus("ALL");
                    setSelectedCategory("ALL");
                    setIsFiltersOpen(false);
                    toast.success("Filters reset successfully");
                  }}
                >
                  Reset Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Categories Summary Switcher */}
          <Button 
            variant="outline" 
            className={cn(
              "flex-1 md:flex-none font-semibold transition-all gap-1.5",
              viewMode === "categories" && "bg-zinc-900 text-white hover:bg-zinc-800"
            )}
            onClick={() => setViewMode(prev => prev === "list" ? "categories" : "list")}
          >
            <Layers className="w-4 h-4" /> Categories
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "list" ? (
        
        /* Table List View */
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <ResponsiveDataTable
            data={filteredInventory}
            columns={[
              {
                header: "Product Name",
                accessorKey: "name",
                cell: (item: any) => (
                  <div 
                    className="flex flex-col cursor-pointer group"
                    onClick={() => {
                      setActiveItem(item);
                      setDialogMode("details");
                    }}
                  >
                    <span className="font-bold text-zinc-900 group-hover:text-primary transition-colors">{item.name}</span>
                    <span className="text-[9px] font-semibold text-muted-foreground tracking-wider uppercase mt-0.5">{item.id}</span>
                  </div>
                ),
              },
              {
                header: "Category",
                accessorKey: "category",
                cell: (item: any) => <Badge variant="secondary" className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 bg-zinc-100 text-zinc-700">{item.category || "General"}</Badge>,
              },
              {
                header: "Stock Level",
                accessorKey: "quantity",
                cell: (item: any) => (
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-black text-sm",
                      item.quantity === 0 ? "text-red-600" :
                      item.quantity <= item.minStock ? "text-amber-600" : "text-zinc-900"
                    )}>
                      {item.quantity}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">(Min: {item.minStock})</span>
                  </div>
                ),
              },
              {
                header: "Price",
                accessorKey: "sellingPrice",
                cell: (item: any) => <span className="font-extrabold text-zinc-900">฿{item.sellingPrice || 0}</span>,
              },
              {
                header: "Status",
                accessorKey: "quantity",
                cell: (item: any) => {
                  const status = item.quantity === 0 ? "OUT_OF_STOCK" : item.quantity <= item.minStock ? "LOW_STOCK" : "IN_STOCK";
                  return (
                    <Badge 
                      className={cn(
                        "border-none font-black text-[9px] uppercase tracking-wider px-2 py-0.5",
                        status === "IN_STOCK" ? "bg-green-100 text-green-700" : 
                        status === "LOW_STOCK" ? "bg-amber-100 text-amber-700" : 
                        "bg-red-100 text-red-700"
                      )}
                    >
                      {status.replace(/_/g, " ")}
                    </Badge>
                  );
                },
              },
              {
                header: "Actions",
                accessorKey: "id",
                cell: (item: any) => (
                    <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-all rounded-lg">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="font-bold text-xs uppercase text-muted-foreground tracking-wide">Stock Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer text-xs font-semibold"
                          onClick={() => {
                            setActiveItem(item);
                            setDialogMode("details");
                          }}
                        >
                          <Package className="w-4 h-4 text-muted-foreground" /> View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer text-xs font-semibold"
                          onClick={() => {
                            setActiveItem(item);
                            setDialogMode("restock");
                          }}
                        >
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" /> Restock
                        </DropdownMenuItem>

                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer text-xs font-semibold"
                          onClick={() => {
                            setActiveItem(item);
                            setDialogMode("writeoff");
                          }}
                        >
                          <ArrowDownRight className="w-4 h-4 text-amber-500" /> Write-off
                        </DropdownMenuItem>

                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer text-xs font-semibold"
                          onClick={() => {
                            setActiveItem(item);
                            setDialogMode("history");
                          }}
                        >
                          <HistoryIcon className="w-4 h-4 text-blue-500" /> Stock History
                        </DropdownMenuItem>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive flex items-center gap-2 cursor-pointer text-xs font-bold focus:bg-red-50 focus:text-red-700"
                        onClick={() => {
                          setActiveItem(item);
                          setDialogMode("delete");
                        }}
                      >
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
                <div 
                  className="p-4 space-y-3 border-b last:border-0 hover:bg-muted/10 cursor-pointer"
                  onClick={() => {
                    setActiveItem(item);
                    setDialogMode("details");
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-zinc-900">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                    </div>
                    <Badge 
                      className={cn(
                        "border-none font-black text-[9px] uppercase px-2 py-0.5",
                        status === "IN_STOCK" ? "bg-green-100 text-green-700" : 
                        status === "LOW_STOCK" ? "bg-amber-100 text-amber-700" : 
                        "bg-red-100 text-red-700"
                      )}
                    >
                      {status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              );
            }}
          />
        </div>
      ) : (
        
        /* Categories Summary Grid Analytics */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-300">
          {uniqueCategories.map(cat => {
            const catItems = inventoryList.filter(i => i.category === cat);
            const totalStock = catItems.reduce((acc, i) => acc + i.quantity, 0);
            const totalAssetVal = catItems.reduce((acc, i) => acc + (Number(i.sellingPrice || 0) * i.quantity), 0);
            const lowStockCount = catItems.filter(i => i.quantity <= i.minStock && i.quantity > 0).length;

            return (
              <Card key={cat} className="border-none shadow-sm relative overflow-hidden group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-zinc-950 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5">{cat}</Badge>
                    <span className="text-xs font-semibold text-muted-foreground">{catItems.length} products</span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-2xl font-black text-zinc-900">฿{totalAssetVal.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Estimated Asset Value</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-4 text-xs font-bold text-zinc-700">
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Total Stock</p>
                      <p className="text-sm font-black text-zinc-900 mt-0.5">{totalStock} units</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Low Alert</p>
                      <p className="text-sm font-black text-amber-600 mt-0.5">{lowStockCount} items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Global Audit Log Timeline History Dialog */}
      <Dialog open={isGlobalHistoryOpen} onOpenChange={setIsGlobalHistoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Stock Audit Timeline</DialogTitle>
            <DialogDescription>Full logs of inventory restocking, damaged adjustments, and write-offs.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 my-2 text-xs text-zinc-800">
            {transactionsList.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8 border border-dashed rounded-lg">No stock transactions logged yet.</p>
            ) : (
              transactionsList.map((tr) => (
                <div key={tr.id} className="p-3 border rounded-xl bg-muted/40 space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <Badge 
                      className={cn(
                        "border-none text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5",
                        tr.type === "IN" ? "bg-green-100 text-green-700" :
                        tr.type === "OUT" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      )}
                    >
                      {tr.type === "IN" ? "RESTOCK (+)" : tr.type === "OUT" ? "WRITE-OFF (-)" : "DAMAGE (-)"}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground font-semibold">{formatEnglishDateTime(tr.createdAt)}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-zinc-900 text-xs">{tr.item?.name || "Inventory Item"}</p>
                    <p className="text-[10px] text-zinc-600 leading-tight">Quantity Actioned: <span className="font-black text-zinc-900">{tr.quantity} units</span></p>
                    {tr.notes && <p className="text-[10px] italic text-muted-foreground mt-1">Staff note: "{tr.notes}"</p>}
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="secondary" size="sm" className="font-bold text-xs" />} />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Action Dialogs Manager */}
      <Dialog 
        open={activeItem !== null && dialogMode !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setActiveItem(null);
            setDialogMode(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          {activeItem && (
            <>
              {/* DETAILS MODE */}
              {dialogMode === "details" && (
                <>
                  <DialogHeader>
                    <div className="flex justify-between items-start mr-6">
                      <div>
                        <DialogTitle className="text-lg font-black text-zinc-900">{activeItem.name}</DialogTitle>
                        <p className="text-[9px] font-mono text-muted-foreground uppercase mt-1">Item ID: {activeItem.id}</p>
                      </div>
                      <Badge className="bg-zinc-100 text-zinc-700 border-none font-black text-[9px] uppercase px-2 py-0.5">{activeItem.category || "General"}</Badge>
                    </div>
                  </DialogHeader>

                  <div className="space-y-4 my-2 text-xs text-zinc-800">
                    <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Current Stock</p>
                        <p className="text-sm font-black text-zinc-900 mt-0.5">{activeItem.quantity} units</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Min Alert Level</p>
                        <p className="text-sm font-black text-zinc-900 mt-0.5">{activeItem.minStock} units</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Selling Price (฿)</p>
                        <p className="text-sm font-black text-zinc-900 mt-0.5">฿{activeItem.sellingPrice || 0}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Category Group</p>
                        <p className="text-sm font-black text-zinc-900 mt-0.5">{activeItem.category || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="bg-zinc-50 border-t mt-4 pt-3 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs font-bold gap-1.5"
                      onClick={() => setDialogMode("restock")}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> Restock
                    </Button>
                    <DialogClose render={<Button variant="secondary" size="sm" className="text-xs font-semibold" />} />
                  </DialogFooter>
                </>
              )}

              {/* RESTOCK / WRITEOFF MODE */}
              {(dialogMode === "restock" || dialogMode === "writeoff") && (
                <form onSubmit={handleStockAction} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-1.5 text-lg font-black text-zinc-900">
                      {dialogMode === "restock" ? (
                        <>
                          <ArrowUpRight className="w-5 h-5 text-emerald-500" /> Restock: {activeItem.name}
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-5 h-5 text-amber-500" /> Write-off: {activeItem.name}
                        </>
                      )}
                    </DialogTitle>
                    <DialogDescription>
                      {dialogMode === "restock" 
                        ? "Increase inventory stock upon arrival of new supply batch."
                        : "Decrease inventory stock due to damage, loss, or expiration."
                      }
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 uppercase tracking-wider text-[10px]">Quantity to Action</label>
                      <Input 
                        type="number" 
                        value={quantityInput}
                        onChange={(e) => setQuantityInput(e.target.value)}
                        className="bg-muted/50 border-none font-semibold text-zinc-900 focus-visible:ring-1 focus-visible:ring-primary"
                        placeholder="e.g. 10" 
                        required
                        min="1"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 uppercase tracking-wider text-[10px]">Staff Audit Notes</label>
                      <textarea
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        className="w-full p-2.5 rounded-lg border bg-muted/40 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 placeholder:text-muted-foreground"
                        placeholder="e.g. Restocked BCAA powders from vendor supplier..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter className="border-t pt-3 flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className={cn(
                        "font-bold text-xs",
                        dialogMode === "restock" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-amber-600 hover:bg-amber-500"
                      )}
                    >
                      {isSubmitting ? "Processing..." : dialogMode === "restock" ? "Save Restock" : "Confirm Write-off"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="sm"
                      className="text-xs font-semibold"
                      onClick={() => {
                        setDialogMode("details");
                        setQuantityInput("10");
                        setNotesInput("");
                      }}
                    >
                      Back
                    </Button>
                  </DialogFooter>
                </form>
              )}

              {/* STOCK HISTORY FOR SPECIFIC ITEM */}
              {dialogMode === "history" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-1.5 text-lg font-black text-zinc-900">
                      <HistoryIcon className="w-5 h-5 text-blue-500" /> Stock Audit: {activeItem.name}
                    </DialogTitle>
                    <DialogDescription>Chronological list of stock movements for this product.</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 my-2 text-xs text-zinc-800">
                    {transactionsList.filter(t => t.itemId === activeItem.id).length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg">No stock transactions registered for this item.</p>
                    ) : (
                      transactionsList.filter(t => t.itemId === activeItem.id).map(tr => (
                        <div key={tr.id} className="p-2.5 border rounded-lg bg-muted/40 flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <Badge 
                              className={cn(
                                "border-none text-[8px] font-black uppercase tracking-wider px-1 py-0.5",
                                tr.type === "IN" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                              )}
                            >
                              {tr.type === "IN" ? "Restock (+)" : "Write-off (-)"}
                            </Badge>
                            <p className="text-[10px] text-zinc-700 leading-tight">Quantity Actioned: <span className="font-bold text-zinc-900">{tr.quantity} units</span></p>
                            {tr.notes && <p className="text-[9px] italic text-muted-foreground">Staff note: "{tr.notes}"</p>}
                          </div>
                          <span className="text-[9px] text-muted-foreground font-semibold shrink-0">{formatEnglishDateTime(tr.createdAt)}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <DialogFooter className="border-t pt-3 mt-2">
                    <DialogClose render={<Button variant="secondary" size="sm" className="text-xs font-semibold" />} />
                  </DialogFooter>
                </>
              )}

              {/* DELETE CONFIRMATION MODE */}
              {dialogMode === "delete" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-1.5 text-lg font-black text-red-600">
                      <Trash className="w-5 h-5" /> Delete Product: {activeItem.name}
                    </DialogTitle>
                    <DialogDescription>
                      Are you sure you want to permanently delete this product from the inventory stock? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter className="border-t pt-3 mt-4 flex gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteProduct} 
                      disabled={isSubmitting}
                      className="font-bold text-xs"
                    >
                      {isSubmitting ? "Deleting..." : "Permanently Delete"}
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="text-xs font-semibold"
                      onClick={() => {
                        setDialogMode(null);
                        setActiveItem(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
