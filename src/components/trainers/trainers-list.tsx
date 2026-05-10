"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Search, 
  Star, 
  Calendar, 
  MoreVertical,
  ChevronRight,
  Award
} from "lucide-react";
import { Input } from "@/components/ui/input";

export function TrainersList({ trainers }: { trainers: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTrainers = trainers.filter((trainer) => {
    const searchStr = searchQuery.toLowerCase();
    return (
      trainer.user.name.toLowerCase().includes(searchStr) ||
      trainer.specialty?.toLowerCase().includes(searchStr) ||
      trainer.level?.toLowerCase().includes(searchStr)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 bg-muted/50 border-none" 
            placeholder="Search trainers by name or specialty..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainers.map((trainer: any) => (
          <Card key={trainer.id} className="border-none shadow-sm group hover:shadow-md transition-all overflow-hidden">
            <div className="h-24 bg-primary relative">
              <Badge className="absolute top-4 right-4 bg-white/20 text-white border-none backdrop-blur-md">
                {trainer.level || "Coach"}
              </Badge>
            </div>
            <CardContent className="pt-0 pb-6 px-6 relative">
              <div className="flex justify-between items-end -mt-12 mb-4">
                <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                  <AvatarImage src={trainer.user.image || ""} />
                  <AvatarFallback className="bg-card text-primary text-2xl font-bold">
                    {trainer.user.name?.split(" ").map((n: string) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2 mb-2">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-full"><Star className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-full"><MoreVertical className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold">{trainer.user.name}</h3>
                <p className="text-sm text-primary font-medium flex items-center gap-1">
                  <Award className="w-4 h-4" /> {trainer.specialty || "Fitness Specialist"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 py-4 border-y border-dashed">
                <div className="text-center border-r border-dashed">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clients</p>
                  <p className="text-lg font-bold">{trainer._count.clients}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sessions</p>
                  <p className="text-lg font-bold">{trainer._count.ptSessions}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button className="flex-1 gap-2">
                  Schedule <Calendar className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="icon">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTrainers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
            <p className="text-muted-foreground">No trainers found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
