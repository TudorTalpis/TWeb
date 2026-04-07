import { PanelLayout } from "@/components/PanelLayout";
import { FileText, Users, LayoutDashboard, Package, UserCog } from "lucide-react";

const adminTabs = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Applications", to: "/admin/applications", icon: FileText },
  { label: "Providers", to: "/admin/providers", icon: Users },
  { label: "Categories", to: "/admin/categories", icon: Package },
  { label: "Users", to: "/admin/users", icon: UserCog },
];

export function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelLayout title="Admin Panel" subtitle="Manage provider applications and listings" tabs={adminTabs}>
      {children}
    </PanelLayout>
  );
}
