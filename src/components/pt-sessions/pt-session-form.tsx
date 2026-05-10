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
import { bookSession } from "@/app/actions/pt-sessions";
import { getSelectionLists } from "@/app/actions/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  memberId: z.string().min(1, "Select a member"),
  trainerId: z.string().min(1, "Select a trainer"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
});

export function PTSessionForm() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberId: "",
      trainerId: "",
      date: new Date().toISOString().split('T')[0],
      startTime: "10:00",
    },
  });

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await getSelectionLists();
        setMembers(data.members || []);
        setTrainers(data.trainers || []);
      } catch (error) {
        toast.error("Failed to load members or trainers");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function onSubmit(values: any) {
    // Construct full date objects for startTime and endTime
    const start = new Date(`${values.date}T${values.startTime}`);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour

    const res = await bookSession({
      ...values,
      startTime: start,
      endTime: end,
      date: new Date(values.date),
    });

    if (res.success) {
      toast.success("Session booked successfully");
      router.refresh();
    } else {
      toast.error("Failed to book session");
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
                className="w-full p-2 rounded-md border bg-background disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="">{isLoading ? "Loading members..." : "Select Member"}</option>
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
          name="trainerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trainer</FormLabel>
              <select 
                {...field} 
                className="w-full p-2 rounded-md border bg-background disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="">{isLoading ? "Loading trainers..." : "Select Trainer"}</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>{t.user.name}</option>
                ))}
              </select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || isLoading}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Booking...
            </>
          ) : (
            "Confirm Booking"
          )}
        </Button>
      </form>
    </Form>
  );
}
