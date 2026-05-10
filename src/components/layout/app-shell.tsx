import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={user.role} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={{ ...user, name: user.name || "User" }} />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto pb-[100px] lg:pb-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav role={user.role} />
    </div>
  );
}
