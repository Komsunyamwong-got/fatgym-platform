"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems, memberNavItems } from "@/lib/nav-config";
import { Role } from "@prisma/client";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface MobileBottomNavProps {
  role: Role;
}

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = role === "MEMBER" ? memberNavItems : navItems.filter((item) => item.roles.includes(role));
  
  const MAX_ITEMS = 5;
  const hasMore = items.length > MAX_ITEMS;
  // If we have more than 5 items, show 4 and a "More" button
  const displayItems = hasMore ? items.slice(0, 4) : items;

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 h-[70px] px-6 flex items-center justify-between pb-safe">
        {displayItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[60px] transition-all",
                isActive ? "text-primary scale-110" : "text-muted-foreground"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {hasMore && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="flex flex-col items-center justify-center gap-1 min-w-[60px] transition-all text-muted-foreground hover:text-primary cursor-pointer border-none bg-transparent outline-none">
              <Menu className="w-6 h-6" />
              <span className="text-[10px] font-medium">More</span>
            </SheetTrigger>
            <SheetContent className="h-[75vh] w-full max-w-md px-4 pb-8 pt-6">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-left text-xl">All Menus</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-4 gap-y-6 gap-x-2 overflow-y-auto pb-10 scrollbar-none h-full content-start">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex flex-col items-center justify-start gap-2 p-2 rounded-xl transition-colors",
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <div className={cn("p-3 rounded-2xl transition-colors", isActive ? "bg-primary text-primary-foreground shadow-md" : "bg-muted")}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-medium text-center leading-tight">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </nav>
    </>
  );
}
