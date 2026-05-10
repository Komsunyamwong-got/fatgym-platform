"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getSelectionLists } from "@/app/actions/utils";
import { recordDirectPayment } from "@/app/actions/direct-payment";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  memberId: z.string().min(1, "Select a member"),
  amount: z.string().transform((val) => parseFloat(val)),
  method: z.string().min(1, "Select payment method"),
});

export function PaymentForm() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberId: "",
      amount: "0" as any,
      method: "CASH",
    },
  });

  useEffect(() => {
    async function load() {
      const data = await getSelectionLists();
      setMembers(data.members);
    }
    load();
  }, []);

  async function onSubmit(values: any) {
    const res = await recordDirectPayment(values);
    if (res.success) {
      toast.success("Transaction recorded successfully");
      router.refresh();
    } else {
      toast.error("Failed to record payment");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="memberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member</FormLabel>
              <select 
                {...field} 
                className="w-full p-2 rounded-md border bg-background"
              >
                <option value="">Select Member</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.user.name}</option>
                ))}
              </select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (฿)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Method</FormLabel>
                <select 
                  {...field} 
                  className="w-full p-2 rounded-md border bg-background"
                >
                  <option value="CASH">Cash</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="PROMPTPAY">PromptPay</option>
                </select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Recording..." : "Save Transaction"}
        </Button>
      </form>
    </Form>
  );
}
