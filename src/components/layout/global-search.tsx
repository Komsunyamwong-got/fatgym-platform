"use client";

import * as React from "react";
import { Search, User, Package, Loader2, Dumbbell, Receipt, Trophy } from "lucide-react";
import { globalSearch } from "@/app/actions/search";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<{ 
    members: any[]; 
    trainers: any[];
    inventory: any[]; 
    programs: any[];
    payments: any[];
  }>({ members: [], trainers: [], inventory: [], programs: [], payments: [] });
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  // Listen for Cmd+K or Ctrl+K and custom event
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    const handleOpen = () => setOpen(true);

    document.addEventListener("keydown", down);
    window.addEventListener("open-global-search", handleOpen);
    
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-global-search", handleOpen);
    };
  }, []);

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const data = await globalSearch(query);
          setResults(data);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ members: [], trainers: [], inventory: [], programs: [], payments: [] });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const onSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const hasResults = Object.values(results).some(arr => arr.length > 0);

  return (
    <>
      <div 
        onClick={() => setOpen(true)}
        className="hidden md:flex relative w-64 group cursor-pointer"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <div className="w-full h-10 px-10 bg-muted/50 rounded-md border border-transparent group-hover:border-primary/50 transition-all flex items-center text-sm text-muted-foreground">
          Search... <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded border shadow-sm">⌘K</span>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden gap-0">
          <div className="flex items-center border-b px-4 py-3">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <Input
              autoFocus
              placeholder="Search members, trainers, products..."
              className="border-none focus-visible:ring-0 text-lg p-0 h-auto bg-transparent"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-2" />}
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2">
            {query.length < 2 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">Type at least 2 characters to search...</p>
            ) : !hasResults && !loading ? (
              <p className="p-4 text-sm text-muted-foreground text-center">No results found for "{query}"</p>
            ) : (
              <div className="space-y-4 pb-2">
                {results.trainers.length > 0 && (
                  <div>
                    <h4 className="px-2 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trainers</h4>
                    <div className="space-y-1">
                      {results.trainers.map((trainer) => (
                        <div
                          key={trainer.id}
                          onClick={() => onSelect(`/trainers`)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <Dumbbell className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{trainer.user.name}</p>
                            <p className="text-[10px] text-muted-foreground">{trainer.specialty || "Fitness Coach"} • {trainer.trainerId}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.members.length > 0 && (
                  <div>
                    <h4 className="px-2 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Members</h4>
                    <div className="space-y-1">
                      {results.members.map((member) => (
                        <div
                          key={member.id}
                          onClick={() => onSelect(`/members`)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{member.user.name}</p>
                            <p className="text-[10px] text-muted-foreground">{member.memberId} • {member.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.inventory.length > 0 && (
                  <div>
                    <h4 className="px-2 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Inventory</h4>
                    <div className="space-y-1">
                      {results.inventory.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => onSelect(`/inventory`)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">{item.category} • In Stock: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.programs.length > 0 && (
                  <div>
                    <h4 className="px-2 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Training Programs</h4>
                    <div className="space-y-1">
                      {results.programs.map((program) => (
                        <div
                          key={program.id}
                          onClick={() => onSelect(`/training-programs`)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                            <Trophy className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{program.name}</p>
                            <p className="text-[10px] text-muted-foreground">{program.level} • {program.duration} Weeks</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.payments.length > 0 && (
                  <div>
                    <h4 className="px-2 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Payments</h4>
                    <div className="space-y-1">
                      {results.payments.map((payment) => (
                        <div
                          key={payment.id}
                          onClick={() => onSelect(`/payments`)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Receipt: {payment.receiptNumber}</p>
                            <p className="text-[10px] text-muted-foreground">฿{payment.amount} • {payment.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-muted/50 px-4 py-2 flex items-center justify-between border-t">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">FAT GYM GLOBAL SEARCH</span>
            <span className="text-[10px] text-muted-foreground">ESC to close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
