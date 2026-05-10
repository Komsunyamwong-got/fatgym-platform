"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateStock } from "@/app/actions/inventory";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown } from "lucide-react";

export function InventoryStockControls({ id, currentStock }: { id: string, currentStock: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpdate(type: "IN" | "OUT") {
    setLoading(true);
    const res = await updateStock(id, 1, type);
    if (res.success) {
      toast.success(type === "IN" ? "Stock added" : "Stock removed");
      router.refresh();
    } else {
      toast.error("Failed to update stock");
    }
    setLoading(false);
  }

  return (
    <div className="flex gap-1">
      <Button 
        variant="outline" 
        size="icon" 
        className="w-7 h-7" 
        disabled={loading || (currentStock === 0)} 
        onClick={() => handleUpdate("OUT")}
      >
        <ArrowDown className="w-3 h-3" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="w-7 h-7" 
        disabled={loading} 
        onClick={() => handleUpdate("IN")}
      >
        <ArrowUp className="w-3 h-3" />
      </Button>
    </div>
  );
}
