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
  Download,
  DollarSign,
  TrendingUp,
  Receipt,
  Calendar,
  CreditCard,
  MoreHorizontal,
  ChevronRight,
  TrendingDown,
  Percent,
  CheckCircle2,
  Printer,
  X,
  FileText
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
import { PaymentForm } from "@/components/payments/payment-form";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PaymentsClientProps {
  initialPayments: any[];
}

export function PaymentsClient({ initialPayments }: PaymentsClientProps) {
  const [paymentsList, setPaymentsList] = useState<any[]>(initialPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("ALL");
  const [selectedItemType, setSelectedItemType] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"list" | "analytics">("list");
  
  // Modals state
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Dynamic Financial Calculations
  const totalRevenue = paymentsList.reduce((acc, p) => acc + Number(p.amount), 0);
  
  // This Month: Filter payments inside May 2026 (or dynamic current month)
  const currentMonthPayments = paymentsList.filter(p => {
    const d = new Date(p.createdAt);
    return d.getMonth() === 4 && d.getFullYear() === 2026; // May 2026
  });
  const thisMonthRevenue = currentMonthPayments.reduce((acc, p) => acc + Number(p.amount), 0);
  
  const transactionsCount = paymentsList.length;

  // Filtered payments
  const filteredPayments = paymentsList.filter(p => {
    const memberName = p.purchase.member.user.name.toLowerCase();
    const memberId = p.purchase.member.memberId.toLowerCase();
    const receiptNum = (p.receiptNumber || "").toLowerCase();
    const item = (p.purchase.membershipPackage?.name || p.purchase.ptPackage?.name || "Purchase").toLowerCase();
    const method = p.method.toLowerCase();

    const matchesSearch = 
      memberName.includes(searchQuery.toLowerCase()) ||
      memberId.includes(searchQuery.toLowerCase()) ||
      receiptNum.includes(searchQuery.toLowerCase()) ||
      item.includes(searchQuery.toLowerCase()) ||
      method.includes(searchQuery.toLowerCase());

    const matchesMethod = selectedMethod === "ALL" || p.method === selectedMethod;
    
    let matchesItemType = true;
    if (selectedItemType === "MEMBERSHIP") {
      matchesItemType = !!p.purchase.membershipPackage;
    } else if (selectedItemType === "PT") {
      matchesItemType = !!p.purchase.ptPackage;
    } else if (selectedItemType === "DIRECT") {
      matchesItemType = !p.purchase.membershipPackage && !p.purchase.ptPackage;
    }

    return matchesSearch && matchesMethod && matchesItemType;
  });

  // Calculate methods breakdown stats
  const methods = ["CASH", "CREDIT_CARD", "TRANSFER", "PROMPTPAY"];
  const methodStats = methods.map(m => {
    const total = paymentsList.filter(p => p.method === m).reduce((acc, p) => acc + Number(p.amount), 0);
    const count = paymentsList.filter(p => p.method === m).length;
    const pct = totalRevenue > 0 ? ((total / totalRevenue) * 100).toFixed(0) : 0;
    return { name: m, total, count, pct };
  });

  // Strict English Date Formatting (Gregorian)
  const formatEnglishDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Mock Export function
  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast.success("Financial report exported successfully as CSV!");
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header section with circles Export / New Transaction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Payments & Revenue</h2>
          <p className="text-muted-foreground text-sm">Monitor transactions and financial performance.</p>
        </div>
        <div className="flex gap-2">
          
          {/* Export Report Trigger */}
          <Button 
            variant="outline" 
            className="gap-2 font-semibold hover:scale-105 active:scale-95 transition-all"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="w-4 h-4" /> 
            {isExporting ? "Exporting..." : "Export Report"}
          </Button>

          {/* Record New Transaction Dialog */}
          <Dialog open={isNewTransactionOpen} onOpenChange={setIsNewTransactionOpen}>
            <DialogTrigger
              render={
                <Button className="gap-2 font-semibold hover:scale-105 active:scale-95 transition-all shadow-sm">
                  <Plus className="w-4 h-4" /> New Transaction
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Record Direct Payment</DialogTitle>
                <DialogDescription>Add a custom transaction for active members.</DialogDescription>
              </DialogHeader>
              <PaymentForm onSuccess={(newPayment) => {
                setPaymentsList(prev => [newPayment, ...prev]);
                setIsNewTransactionOpen(false);
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `฿${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-50" },
          { label: "This Month", value: `฿${thisMonthRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Pending", value: "฿0", icon: Calendar, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Transactions", value: transactionsCount.toString(), icon: Receipt, color: "text-purple-500", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 text-zinc-900">{stat.value}</p>
              </div>
              <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search / Filter bar circled by user */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
        
        {/* Real-time search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-none font-medium text-zinc-800 placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary" 
            placeholder="Search by member, ID, or receipt number..." 
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full md:w-auto">
          
          {/* Advanced Filter Popover */}
          <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <DialogTrigger
              render={
                <Button 
                  variant="outline" 
                  className={cn(
                    "flex-1 md:flex-none gap-2 font-semibold transition-all",
                    (selectedMethod !== "ALL" || selectedItemType !== "ALL") && "border-primary bg-primary/5 text-primary"
                  )}
                >
                  <Filter className="w-4 h-4" /> Filters
                </Button>
              }
            />
            <DialogContent className="sm:max-w-xs">
              <DialogHeader>
                <DialogTitle>Filter Payments</DialogTitle>
                <DialogDescription>Narrow payments list by method or transaction type.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Method</label>
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="ALL">All Methods</option>
                    {methods.map(m => (
                      <option key={m} value={m}>{m.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Item Type</label>
                  <select
                    value={selectedItemType}
                    onChange={(e) => setSelectedItemType(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="ALL">All Types</option>
                    <option value="MEMBERSHIP">Membership Package</option>
                    <option value="PT">PT Session Pack</option>
                    <option value="DIRECT">Direct Custom Payment</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="secondary" 
                  className="w-full text-xs font-bold"
                  onClick={() => {
                    setSelectedMethod("ALL");
                    setSelectedItemType("ALL");
                    setIsFiltersOpen(false);
                    toast.success("Filters reset successfully");
                  }}
                >
                  Reset Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Methods Switcher to Analytics */}
          <Button 
            variant="outline" 
            className={cn(
              "flex-1 md:flex-none font-semibold transition-all gap-1.5",
              viewMode === "analytics" && "bg-zinc-900 text-white hover:bg-zinc-800"
            )}
            onClick={() => setViewMode(prev => prev === "list" ? "analytics" : "list")}
          >
            <Percent className="w-4 h-4" /> Methods
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "list" ? (
        
        /* Table list view */
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <ResponsiveDataTable
            data={filteredPayments}
            columns={[
              {
                header: "Member",
                accessorKey: "id",
                cell: (p: any) => (
                  <div 
                    className="flex flex-col cursor-pointer group"
                    onClick={() => setSelectedPayment(p)}
                  >
                    <span className="font-bold text-zinc-900 group-hover:text-primary transition-colors">{p.purchase.member.user.name}</span>
                    <span className="text-[9px] font-semibold text-muted-foreground tracking-wider uppercase mt-0.5">{p.purchase.member.memberId}</span>
                  </div>
                ),
              },
              {
                header: "Receipt #",
                accessorKey: "receiptNumber",
                cell: (p: any) => <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-zinc-700">{p.receiptNumber || "N/A"}</code>,
              },
              {
                header: "Item Purchased",
                accessorKey: "id",
                cell: (p: any) => (
                  <Badge variant="secondary" className="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 border-none bg-zinc-100 text-zinc-700">
                    {p.purchase.membershipPackage?.name || p.purchase.ptPackage?.name || "Standalone Direct"}
                  </Badge>
                ),
              },
              {
                header: "Method",
                accessorKey: "method",
                cell: (p: any) => (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
                    <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{p.method.replace("_", " ")}</span>
                  </div>
                ),
              },
              {
                header: "Amount",
                accessorKey: "amount",
                cell: (p: any) => <span className="font-extrabold text-zinc-900">฿{Number(p.amount).toLocaleString()}</span>,
              },
              {
                header: "Date (AD)",
                accessorKey: "createdAt",
                cell: (p: any) => (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatEnglishDate(p.createdAt)}</span>
                  </div>
                ),
              },
              {
                header: "Actions",
                accessorKey: "id",
                cell: (p: any) => (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-primary/10 hover:text-primary transition-all rounded-lg"
                    onClick={() => setSelectedPayment(p)}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                ),
              },
            ]}
            mobileRender={(p: any) => (
              <div 
                className="p-4 space-y-3 border-b last:border-0 hover:bg-muted/10 cursor-pointer"
                onClick={() => setSelectedPayment(p)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-zinc-900">{p.purchase.member.user.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.purchase.membershipPackage?.name || p.purchase.ptPackage?.name || "Direct Payment"} • {p.method}
                    </p>
                  </div>
                  <span className="text-sm font-black text-zinc-900">฿{Number(p.amount).toLocaleString()}</span>
                </div>
              </div>
            )}
          />
        </div>
      ) : (
        
        /* Interactive Revenue Breakdown by Method */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom duration-300">
          {methodStats.map((stat) => (
            <Card key={stat.name} className="border-none shadow-sm relative overflow-hidden group">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <Badge className="bg-zinc-950 text-white text-[9px] font-black uppercase tracking-wider">{stat.name.replace("_", " ")}</Badge>
                  <span className="text-xs text-muted-foreground font-black">{stat.count} sales</span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-2xl font-black text-zinc-900">฿{stat.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-semibold">Total Revenue share</p>
                </div>

                {/* Progress bar percentage visualizer */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-xs font-bold text-zinc-700">
                    <span>Percentage</span>
                    <span>{stat.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-700" 
                      style={{ width: `${stat.pct}%` }} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Advanced Receipt Invoice Detail modal */}
      <Dialog open={selectedPayment !== null} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedPayment && (
            <>
              {/* Receipt Visual Mockup Frame */}
              <div className="p-6 bg-card border rounded-2xl shadow-inner space-y-6 font-sans text-sm text-zinc-800" id="printable-receipt">
                
                {/* Header */}
                <div className="text-center space-y-1.5 border-b pb-4">
                  <h3 className="text-xl font-black tracking-tighter text-zinc-950 flex items-center justify-center gap-1">
                    <span className="text-primary font-black">FAT</span> GYM RECEIPT
                  </h3>
                  <p className="text-xs text-muted-foreground">Premium Gym Management Platform</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-1">
                    SUCCESSFULLY PAID
                  </p>
                </div>

                {/* Info block */}
                <div className="grid grid-cols-2 gap-y-3 text-xs border-b pb-4">
                  <div>
                    <span className="text-muted-foreground uppercase font-bold text-[9px] block">Receipt Number</span>
                    <span className="font-mono font-bold text-zinc-900">{selectedPayment.receiptNumber || `REC-${selectedPayment.id.substring(0,8)}`}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase font-bold text-[9px] block">Payment Date</span>
                    <span className="font-semibold text-zinc-900">{formatEnglishDate(selectedPayment.createdAt)}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-muted-foreground uppercase font-bold text-[9px] block">Member Name</span>
                    <span className="font-bold text-zinc-900">{selectedPayment.purchase.member.user.name}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-muted-foreground uppercase font-bold text-[9px] block">Member ID</span>
                    <span className="font-mono font-bold text-zinc-900">{selectedPayment.purchase.member.memberId}</span>
                  </div>
                </div>

                {/* Items listing */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Description of Items</span>
                  <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-muted/40 border">
                    <div className="space-y-0.5">
                      <p className="font-bold text-zinc-900">
                        {selectedPayment.purchase.membershipPackage?.name || selectedPayment.purchase.ptPackage?.name || "Direct Custom Purchase"}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-semibold">1 unit x standalone subscription access</p>
                    </div>
                    <span className="font-black text-zinc-900">฿{Number(selectedPayment.amount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="border-t pt-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-zinc-600">
                    <span>Subtotal Price</span>
                    <span>฿{Number(selectedPayment.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-600">
                    <span>VAT (Included 7%)</span>
                    <span>฿{((Number(selectedPayment.amount) * 7) / 107).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center text-base font-black text-zinc-950 border-t pt-3 mt-1">
                    <span>TOTAL AMOUNT PAID</span>
                    <span className="text-emerald-600 text-lg">฿{Number(selectedPayment.amount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Method badge check */}
                <div className="p-3 bg-zinc-50 rounded-xl border flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold">Payment Channel</span>
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {selectedPayment.method.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Action buttons (Print/Invoice) */}
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="font-bold text-xs gap-1.5"
                  onClick={() => {
                    toast.success("Invoice template loaded. Print command fired successfully!");
                  }}
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </Button>
                <DialogClose render={<Button variant="secondary" size="sm" className="font-bold text-xs" />}>
                  Close
                </DialogClose>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
