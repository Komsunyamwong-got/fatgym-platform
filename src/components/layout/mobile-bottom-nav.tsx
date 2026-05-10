"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems, memberNavItems } from "@/lib/nav-config";
import { Role } from "@prisma/client";

interface MobileBottomNavProps {
  role: Role;
}

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname();

  const items = role === "MEMBER" ? memberNavItems : navItems.filter((item) => item.roles.includes(role));
  
  // Only show top 5 items on bottom nav
  const displayItems = items.slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 h-[70px] px-6 flex items-center justify-between pb-safe">
      {displayItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

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
    </nav>
  );
}
