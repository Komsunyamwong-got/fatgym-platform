"use client";

import { useState, useEffect } from "react";
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
  Award,
  Trash,
  Phone,
  Mail,
  User,
  Users,
  Dumbbell
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addTrainer, deleteTrainer } from "@/app/actions/trainers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function TrainersList({ trainers }: { trainers: any[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState("Junior");
  const [specialty, setSpecialty] = useState("");

  // Validation States
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("favorite_trainers");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const toggleFavorite = (id: string) => {
    let newFavs = [...favorites];
    if (favorites.includes(id)) {
      newFavs = newFavs.filter(favId => favId !== id);
      toast.success("Removed from favorites");
    } else {
      newFavs.push(id);
      toast.success("Added to favorites");
    }
    setFavorites(newFavs);
    localStorage.setItem("favorite_trainers", JSON.stringify(newFavs));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setEmailError("");

    let hasError = false;

    if (!name.trim()) {
      setNameError("Trainer name is required");
      hasError = true;
    }

    if (!email.trim()) {
      setEmailError("Email address is required");
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError("Please enter a valid email address (e.g. name@example.com)");
        hasError = true;
      }
    }

    if (hasError) return;

    setIsAdding(true);
    const res = await addTrainer({ name, email, phone, level, specialty });
    if (res.success) {
      toast.success("Trainer added successfully");
      setAddOpen(false);
      // Reset Form
      setName("");
      setEmail("");
      setPhone("");
      setLevel("Junior");
      setSpecialty("");
    } else {
      toast.error(res.error || "Failed to add trainer");
    }
    setIsAdding(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await deleteTrainer(deleteTarget.id);
    if (res.success) {
      toast.success("Trainer removed successfully");
      setDeleteTarget(null);
    } else {
      toast.error(res.error || "Failed to remove trainer");
    }
    setIsDeleting(false);
  };

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
      {/* Coaching Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Coaching Staff</h2>
          <p className="text-muted-foreground text-sm">Manage your personal trainers and performance.</p>
        </div>
        
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger
            render={
              <button className="gap-2 h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-lg text-sm font-medium shadow-sm hover:scale-[1.02] transition-all cursor-pointer outline-none focus:ring-2 focus:ring-ring">
                <Plus className="w-4 h-4" /> Add Trainer
              </button>
            }
          />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Trainer</DialogTitle>
              <DialogDescription>
                Create a trainer profile. This will automatically set their system role as Trainer.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4" noValidate>
              <div className="space-y-2">
                <label className="text-sm font-bold">Trainer Name <span className="text-red-500">*</span></label>
                <Input 
                  placeholder="e.g. Coach Mike" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className={nameError ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                />
                {nameError && <p className="text-xs font-bold text-red-500 mt-1">{nameError}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Email Address <span className="text-red-500">*</span></label>
                <Input 
                  type="email" 
                  placeholder="e.g. mike@fatgym.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className={emailError ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                />
                {emailError && <p className="text-xs font-bold text-red-500 mt-1">{emailError}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Phone Number</label>
                <Input placeholder="e.g. 081-234-5678" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Coaching Level</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={level} 
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Specialty</label>
                <Input placeholder="e.g. Weight Loss & Powerlifting" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isAdding}>{isAdding ? "Adding..." : "Add Trainer"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Filter */}
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

      {/* Trainers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainers.map((trainer: any) => {
          const isFav = favorites.includes(trainer.id);
          return (
            <Card key={trainer.id} className={`border-none shadow-sm group hover:shadow-md transition-all overflow-hidden relative ${isFav ? 'ring-2 ring-yellow-400/50' : ''}`}>
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
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className={`h-9 w-9 rounded-full transition-colors ${isFav ? 'bg-yellow-50 text-yellow-500 border-yellow-200' : 'hover:text-yellow-500'}`}
                      onClick={() => toggleFavorite(trainer.id)}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-yellow-500' : ''}`} />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button className="h-9 w-9 rounded-full border border-border bg-background hover:bg-muted text-foreground flex items-center justify-center shadow-sm cursor-pointer transition-colors outline-none focus:ring-2 focus:ring-ring">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Trainer Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setDetailTarget(trainer)}>
                            <User className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/schedule?trainerId=${trainer.id}`)}>
                            <Calendar className="w-4 h-4 mr-2" /> View Schedule
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => setDeleteTarget(trainer)}>
                            <Trash className="w-4 h-4 mr-2" /> Remove Trainer
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                  <Button 
                    className="flex-1 gap-2 shadow-sm" 
                    render={
                      <Link href={`/schedule?trainerId=${trainer.id}`}>
                        Schedule <Calendar className="w-4 h-4" />
                      </Link>
                    }
                  />
                  <Button variant="secondary" size="icon" onClick={() => setDetailTarget(trainer)} className="hover:scale-105 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredTrainers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
            <p className="text-muted-foreground">No trainers found matching your search.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Remove Trainer</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to remove <strong className="text-foreground">{deleteTarget?.user.name}</strong> from the coaching staff? This will also delete their credentials and cascade all related database files. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trainer Details Sheet */}
      <Sheet open={!!detailTarget} onOpenChange={(open) => !open && setDetailTarget(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-6 border-b">
            <SheetTitle className="text-2xl font-black">Trainer Details</SheetTitle>
            <SheetDescription>Detailed card view of trainer qualifications and stats.</SheetDescription>
          </SheetHeader>
          {detailTarget && (
            <div className="space-y-6 pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="w-28 h-28 border-4 border-primary/10 shadow-md">
                  <AvatarImage src={detailTarget.user.image || ""} />
                  <AvatarFallback className="bg-primary/5 text-primary text-3xl font-black">
                    {detailTarget.user.name?.split(" ").map((n: string) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-black">{detailTarget.user.name}</h2>
                  <div className="flex gap-2 justify-center mt-2">
                    <Badge variant="secondary">{detailTarget.level || "Coach"}</Badge>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">{detailTarget.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-muted/20 p-4 rounded-2xl border">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Contact Info</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /> {detailTarget.user.email}</div>
                  <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /> {detailTarget.phone || "N/A"}</div>
                  <div className="flex items-center gap-3"><User className="w-4 h-4 text-primary" /> Trainer ID: {detailTarget.trainerId}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Specialization</h3>
                <div className="flex items-center gap-3 p-4 rounded-xl border bg-card shadow-sm">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="font-bold text-sm">{detailTarget.specialty || "Fitness Specialist"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-card shadow-sm text-center">
                  <Users className="w-5 h-5 mx-auto text-primary mb-2" />
                  <span className="text-xs text-muted-foreground font-bold block uppercase tracking-wider">Active Clients</span>
                  <span className="text-2xl font-black text-foreground block mt-1">{detailTarget._count.clients}</span>
                </div>
                <div className="p-4 rounded-xl border bg-card shadow-sm text-center">
                  <Dumbbell className="w-5 h-5 mx-auto text-primary mb-2" />
                  <span className="text-xs text-muted-foreground font-bold block uppercase tracking-wider">Total Sessions</span>
                  <span className="text-2xl font-black text-foreground block mt-1">{detailTarget._count.ptSessions}</span>
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <Button 
                  className="w-full gap-2" 
                  render={
                    <Link href={`/schedule?trainerId=${detailTarget.id}`}>
                      <Calendar className="w-4 h-4" /> Go to Schedule
                    </Link>
                  }
                />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
