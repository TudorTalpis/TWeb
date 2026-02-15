import { Link, useLocation } from "react-router-dom";
import { type LucideIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PanelLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  tabs: { label: string; to: string; icon: LucideIcon }[];
}

export function PanelLayout({ children, title, subtitle, tabs }: PanelLayoutProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile: overlay sidebar
  if (isMobile) {
    return (
      <div className="mx-auto max-w-7xl animate-fade-in relative">
        {/* Mobile toggle button */}
        {!mobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="fixed bottom-4 left-4 z-40 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Overlay backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar drawer */}
        <aside
          className={cn(
            "fixed top-0 left-0 z-50 h-full w-60 bg-card border-r shadow-floating transition-transform duration-300 flex flex-col",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h1 className="font-display text-sm font-bold truncate">{title}</h1>
              {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
            </div>
            <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex-1 p-2 space-y-0.5">
            {tabs.map((tab) => {
              const active = location.pathname === tab.to;
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-h-[calc(100vh-4rem)] p-4">
          {children}
        </main>
      </div>
    );
  }

  // Desktop: original sidebar
  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside
          onMouseEnter={() => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
            setCollapsed(false);
          }}
          onMouseLeave={() => {
            hoverTimeout.current = setTimeout(() => setCollapsed(true), 400);
          }}
          className={cn(
            "sticky top-16 self-start shrink-0 border-r bg-card/50 transition-all duration-500 flex flex-col",
            collapsed ? "w-14" : "w-44"
          )}
          style={{ height: "calc(100vh - 4rem)" }}
        >
          {!collapsed && (
            <div className="p-3 border-b">
              <h1 className="font-display text-xs font-bold truncate">{title}</h1>
              {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{subtitle}</p>}
            </div>
          )}
          <nav className="flex-1 p-2 space-y-0.5">
            {tabs.map((tab) => {
              const active = location.pathname === tab.to;
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  title={collapsed ? tab.label : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{tab.label}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
