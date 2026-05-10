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
import { createClass } from "@/app/actions/classes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  trainerId: z.string().min(1, "Select a trainer"),
  capacity: z.string().transform((val) => parseInt(val, 10)),
  startTime: z.string().min(1, "Start time is required"),
  date: z.string().min(1, "Date is required"),
});

export function ClassForm() {
  const router = useRouter();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      trainerId: "",
      capacity: "20" as any,
      date: new Date().toISOString().split('T')[0],
      startTime: "18:00",
    },
  });

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await getSelectionLists();
        setTrainers(data.trainers || []);
      } catch (error) {
        toast.error("Failed to load trainers");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function onSubmit(values: any) {
    const start = new Date(`${values.date}T${values.startTime}`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const res = await createClass({
      ...values,
      startTime: start,
      endTime: end,
    });

    if (res.success) {
      toast.success("Class created successfully");
      router.refresh();
    } else {
      toast.error("Failed to create class");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Name</FormLabel>
              <FormControl>
                <Input placeholder="E.g. Yoga Flow" {...field} />
              </FormControl>
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
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || isLoading}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Class"
          )}
        </Button>
      </form>
    </Form>
  );
}
