import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  DollarSign,
  TrendingUp,
  Receipt,
  Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { PaymentForm } from "@/components/payments/payment-form";
import { cn } from "@/lib/utils";
import { getPayments } from "@/app/actions/payments";
import { PaymentsTable } from "@/components/payments/payments-table";

export default async function PaymentsPage() {
  const payments = await getPayments();
  const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amount), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Payments & Revenue</h2>
          <p className="text-muted-foreground text-sm">Monitor transactions and financial performance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export Report
          </Button>
          <Dialog>
            <DialogTrigger
              render={
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> New Transaction
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
              </DialogHeader>
              <PaymentForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `฿${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-50" },
          { label: "This Month", value: "฿45,200", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Pending", value: "฿0", icon: Calendar, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Transactions", value: payments.length.toString(), icon: Receipt, color: "text-purple-500", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-10 bg-muted/50 border-none" placeholder="Search by member, ID, or reference..." />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none">Methods</Button>
        </div>
      </div>

      <PaymentsTable payments={payments} />
    </div>
  );
}
