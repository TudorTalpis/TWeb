import { PanelLayout } from "@/components/PanelLayout";
import { User, Briefcase, CalendarDays, BookOpen, LayoutDashboard } from "lucide-react";

const providerTabs = [
  { label: "Dashboard", to: "/provider/dashboard", icon: LayoutDashboard },
  { label: "Bookings", to: "/provider/bookings", icon: BookOpen },
  { label: "Services", to: "/provider/services", icon: Briefcase },
  { label: "Schedule", to: "/provider/schedule", icon: CalendarDays },
  { label: "Profile", to: "/provider/profile", icon: User },
];

export function ProviderPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelLayout title="Provider Panel" subtitle="Manage your services, schedule, and bookings" tabs={providerTabs}>
      {children}
    </PanelLayout>
  );
}
