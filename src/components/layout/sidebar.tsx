"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/nav-config";
import { Role } from "@prisma/client";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  role: Role;
  gymName?: string;
  logoUrl?: string;
}

export function Sidebar({ role, gymName = "FAT GYM", logoUrl }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r bg-card transition-all duration-300 h-screen sticky top-0 z-40",
        collapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      <div className="p-6 flex items-center justify-between h-[80px]">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Gym Logo" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-xl">{gymName.charAt(0)}</span>
              </div>
            )}
            <span className="font-bold text-xl tracking-tight truncate" title={gymName}>{gymName}</span>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt="Gym Logo" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">{gymName.charAt(0)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-none">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "" : "group-hover:scale-110 transition-transform")} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex justify-center hover:bg-accent"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg">
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
