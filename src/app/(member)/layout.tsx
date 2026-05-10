import { AppShell } from "@/components/layout/app-shell";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MemberPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  // Ensure only members or owners can access this group
  if (session.user.role !== "MEMBER" && session.user.role !== "OWNER") {
    redirect("/dashboard");
  }

  return <AppShell>{children}</AppShell>;
}
