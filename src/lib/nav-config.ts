import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  BicepsFlexed,
  FileText,
  TrendingUp,
  CreditCard,
  Package,
  MessageSquare,
  BarChart3,
  Settings,
  ClipboardList,
} from "lucide-react";

export const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["OWNER", "GM", "ADMIN", "RECEPTION", "SALES", "TRAINER"],
  },
  {
    label: "Members",
    href: "/members",
    icon: Users,
    roles: ["OWNER", "GM", "ADMIN", "RECEPTION", "SALES"],
  },
  {
    label: "Trainers",
    href: "/trainers",
    icon: UserCheck,
    roles: ["OWNER", "GM", "ADMIN"],
  },
  {
    label: "Schedule",
    href: "/schedule",
    icon: Calendar,
    roles: ["OWNER", "GM", "ADMIN", "RECEPTION", "TRAINER"],
  },
  {
    label: "Classes",
    href: "/classes",
    icon: ClipboardList,
    roles: ["OWNER", "GM", "ADMIN", "RECEPTION"],
  },
  {
    label: "PT Sessions",
    href: "/pt-sessions",
    icon: BicepsFlexed,
    roles: ["OWNER", "GM", "ADMIN", "RECEPTION", "TRAINER"],
  },
  {
    label: "Training Programs",
    href: "/training-programs",
    icon: FileText,
    roles: ["OWNER", "GM", "ADMIN", "TRAINER"],
  },
  {
    label: "Leads",
    href: "/leads",
    icon: TrendingUp,
    roles: ["OWNER", "GM", "ADMIN", "SALES"],
  },
  {
    label: "Payments",
    href: "/payments",
    icon: CreditCard,
    roles: ["OWNER", "GM", "ADMIN", "RECEPTION"],
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: Package,
    roles: ["OWNER", "GM", "ADMIN"],
  },
  {
    label: "Complaints",
    href: "/complaints",
    icon: MessageSquare,
    roles: ["OWNER", "GM", "ADMIN"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["OWNER", "GM"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["OWNER", "GM", "ADMIN"],
  },
];

export const memberNavItems = [
  {
    label: "Dashboard",
    href: "/member/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Membership",
    href: "/member/membership",
    icon: CreditCard,
  },
  {
    label: "PT Sessions",
    href: "/member/pt-sessions",
    icon: BicepsFlexed,
  },
  {
    label: "Training Plan",
    href: "/member/training-plan",
    icon: FileText,
  },
  {
    label: "Classes",
    href: "/member/classes",
    icon: Calendar,
  },
  {
    label: "Profile",
    href: "/member/profile",
    icon: Settings,
  },
];
