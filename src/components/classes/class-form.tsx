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
  capacity: z.string().min(1, "Capacity is required"),
  startTime: z.string().min(1, "Start time is required"),
  date: z.string().min(1, "Date is required"),
});

export function ClassForm() {
  const router = useRouter();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Setup options for pure English selectors
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);
  
  const timeSlots = Array.from({ length: 30 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7; // 7 AM to 9:30 PM
    const min = i % 2 === 0 ? "00" : "30";
    const padHour = String(hour).padStart(2, '0');
    return `${padHour}:${min}`;
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      trainerId: "",
      capacity: "20",
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
      capacity: parseInt(values.capacity, 10),
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
                className="w-full p-2 rounded-lg border border-input bg-background text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
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
            render={({ field }) => {
              const val = field.value || new Date().toISOString().split('T')[0];
              const [y, m, d] = val.split('-');
              
              const updateDate = (newY: string, newM: string, newD: string) => {
                field.onChange(`${newY}-${newM}-${newD.padStart(2, '0')}`);
              };

              return (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <div className="grid grid-cols-3 gap-1">
                    <select 
                      value={d}
                      onChange={(e) => updateDate(y, m, e.target.value)}
                      className="p-2 text-xs rounded-lg border border-input bg-background font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {days.map(day => (
                        <option key={day} value={String(day).padStart(2, '0')}>{day}</option>
                      ))}
                    </select>
                    <select 
                      value={m}
                      onChange={(e) => updateDate(y, e.target.value, d)}
                      className="p-2 text-xs rounded-lg border border-input bg-background font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {months.map(mon => (
                        <option key={mon.value} value={mon.value}>{mon.label.substring(0, 3)}</option>
                      ))}
                    </select>
                    <select 
                      value={y}
                      onChange={(e) => updateDate(e.target.value, m, d)}
                      className="p-2 text-xs rounded-lg border border-input bg-background font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {years.map(yr => (
                        <option key={yr} value={String(yr)}>{yr}</option>
                      ))}
                    </select>
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <select 
                    {...field}
                    className="w-full p-2 rounded-lg border border-input bg-background text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
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
