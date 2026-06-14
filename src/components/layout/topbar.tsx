"use client";

import { usePathname } from "next/navigation";
import { navItems, memberNavItems } from "@/lib/nav-config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, LogOut, Settings, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Role } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalSearch } from "./global-search";
import Link from "next/link";

interface TopbarProps {
  user: {
    name: string;
    role: Role;
    image?: string | null;
  };
  gymName?: string;
  logoUrl?: string;
}

export function Topbar({ user, gymName = "FAT GYM", logoUrl }: TopbarProps) {
  const pathname = usePathname();
  
  const allItems = [...navItems, ...memberNavItems];
  const currentItem = allItems.find((item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`)));
  const title = currentItem?.label || "FAT GYM";

  return (
    <header className="h-[70px] border-b bg-card flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="lg:hidden flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt="Gym Logo" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-lg">{gymName.charAt(0)}</span>
            </div>
          )}
          <h1 className="text-xl font-bold tracking-tight sm:hidden max-w-[140px] truncate">{title}</h1>
        </div>
        <h1 className="text-xl font-bold lg:text-2xl tracking-tight hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <GlobalSearch />

        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-card" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button type="button" className="flex items-center gap-3 border-l pl-4 ml-2 cursor-pointer hover:opacity-80 transition-opacity outline-none">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold leading-none">{user.name}</span>
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">{user.role}</span>
                </div>
                <Avatar className="w-10 h-10 border-2 border-primary/20">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user.name.split(" ").map((n: string) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/settings" className="w-full">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Settings className="w-4 h-4" /> Settings
                </DropdownMenuItem>
              </Link>
              <Link href="/profile" className="w-full">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <UserIcon className="w-4 h-4" /> Profile
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive flex items-center gap-2 cursor-pointer">
              <LogOut className="w-4 h-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
