import { Link, useLocation } from "react-router-dom";
import { type LucideIcon, ChevronRight, X } from "lucide-react";
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

  const SidebarContent = () => (
      <>
        {!collapsed && (
            <div className="px-4 py-4 border-b border-border/50">
              <p className="font-display text-xs font-bold text-foreground truncate">{title}</p>
              {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug truncate">{subtitle}</p>}
            </div>
        )}
        <nav className="flex-1 p-2 space-y-0.5">
          {tabs.map((tab) => {
            const active = location.pathname === tab.to;
            return (
                <Link
                    key={tab.to}
                    to={tab.to}
                    onClick={() => isMobile && setMobileOpen(false)}
                    title={collapsed && !isMobile ? tab.label : undefined}
                    className={cn(
                        "flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-medium transition-all duration-200",
                        active
                            ? "bg-primary/12 text-primary shadow-sm glow-border"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                    )}
                >
                  <tab.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                  {(!collapsed || isMobile) && <span className="truncate">{tab.label}</span>}
                </Link>
            );
          })}
        </nav>
      </>
  );

  if (isMobile) {
    return (
        <div className="animate-fade-in relative">
          {/* Mobile toggle button */}
          {!mobileOpen && (
              <button
                  onClick={() => setMobileOpen(true)}
                  className="fixed bottom-5 left-4 z-40 h-11 w-11 rounded-2xl gradient-primary text-white shadow-glow flex items-center justify-center transition-all hover:scale-110 btn-glow"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
          )}

          {/* Overlay backdrop */}
          {mobileOpen && (
              <div
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                  onClick={() => setMobileOpen(false)}
              />
          )}

          {/* Sidebar drawer */}
          <aside
              className={cn(
                  "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border/60 shadow-floating transition-transform duration-300 flex flex-col",
                  mobileOpen ? "translate-x-0" : "-translate-x-full"
              )}
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div>
                <p className="font-display text-sm font-bold truncate">{title}</p>
                {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-secondary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent />
          </aside>

          <main className="min-h-[calc(100vh-4rem)] p-4">
            {children}
          </main>
        </div>
    );
  }

  return (
      <div className="animate-fade-in">
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
                  "sticky top-16 self-start shrink-0 border-r border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 flex flex-col",
                  collapsed ? "w-14" : "w-48"
              )}
              style={{ height: "calc(100vh - 4rem)" }}
          >
            <SidebarContent />
          </aside>
          <main className="flex-1 p-6 min-w-0">
            {children}
          </main>
        </div>
      </div>
  );
}
