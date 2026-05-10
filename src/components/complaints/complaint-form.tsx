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
import { Textarea } from "@/components/ui/textarea";
import { getSelectionLists } from "@/app/actions/utils";
import { createComplaint } from "@/app/actions/complaints";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  memberId: z.string().min(1, "Select a member"),
  type: z.string().min(1, "Type is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
});

export function ComplaintForm() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberId: "",
      type: "FACILITY",
      description: "",
    },
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getSelectionLists();
        if (data && data.members) {
          setMembers(data.members);
        }
      } catch (error) {
        console.error("Failed to load members for complaint form:", error);
      }
    }
    load();
  }, []);

  async function onSubmit(values: any) {
    const res = await createComplaint(values);
    if (res.success) {
      toast.success("Complaint recorded");
      router.refresh();
    } else {
      toast.error("Failed to record complaint");
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
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <select 
                {...field} 
                className="w-full p-2 rounded-md border bg-background"
              >
                <option value="FACILITY">Facility / Equipment</option>
                <option value="SERVICE">Service Quality</option>
                <option value="TRAINER">Trainer / Coach</option>
                <option value="BILLING">Billing / Payment</option>
                <option value="OTHER">Other</option>
              </select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the issue..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Submit Ticket"}
        </Button>
      </form>
    </Form>
  );
}
