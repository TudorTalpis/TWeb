import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, X, LogOut, ChevronDown, LayoutDashboard, Home, Search, Grid3X3, Settings, RotateCcw, Zap } from "lucide-react";
import { useAppStore } from "@/store/AppContext";
import { useI18n, LANGUAGE_OPTIONS } from "@/store/I18nContext";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { state, dispatch, currentUser, hasRole, resetData } = useAppStore();
  const { t, lang, setLang } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = state.notifications.filter(
      (n) => n.userId === state.session.userId && !n.read
  ).length;

  const isActive = (path: string) => location.pathname === path;
  const isActivePrefix = (path: string) => location.pathname.startsWith(path);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/categories?q=${encodeURIComponent(q)}`);
    } else {
      if (location.pathname === "/categories") navigate("/categories");
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const q = urlParams.get("q") || "";
    setSearchQuery(q);
  }, [location.search]);

  const currentLangCode = lang.toUpperCase();

  return (
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-primary shadow-glow transition-all duration-300 group-hover:shadow-[0_0_24px_hsl(249_89%_68%/0.45)]">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="hidden sm:inline font-display text-lg font-bold text-foreground tracking-tight">
            Serve<span className="text-primary">Hub</span>
          </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-0.5 lg:flex">
            <NavItem to="/" label={t("nav.home")} active={isActive("/")} />
            <NavItem to="/categories" label={t("nav.providers")} active={isActive("/categories")} />
            {hasRole(["USER", "PROVIDER"]) && (
                <NavItem to="/dashboard" label={t("nav.bookings")} active={isActive("/dashboard")} />
            )}
            {hasRole(["PROVIDER"]) && (
                <NavItem to="/provider/bookings" label={t("nav.provider")} active={isActivePrefix("/provider")} />
            )}
            {hasRole(["ADMIN"]) && (
                <NavItem to="/admin/dashboard" label={t("nav.admin")} active={isActivePrefix("/admin")} />
            )}
          </div>

          {/* Centered search bar (desktop) */}
          <form onSubmit={handleSearch} className="hidden flex-1 justify-center md:flex">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                  placeholder={t("nav.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-full border-border/60 bg-secondary/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:bg-card focus:border-primary/40 focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1.5">
            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground text-xs font-semibold tracking-wide">
                  {currentLangCode}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px] bg-card border-border/60">
                {LANGUAGE_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                        key={opt.code}
                        onClick={() => setLang(opt.code)}
                        className={`${lang === opt.code ? "bg-primary/10 text-primary" : ""}`}
                    >
                      <span className="text-sm font-medium">{opt.code.toUpperCase()}</span>
                    </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {currentUser && (
                <>
                  {/* Notification bell */}
                  <Link
                      to="/notifications"
                      className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                  >
                    <Bell className="h-[17px] w-[17px]" />
                    {unreadCount > 0 && (
                        <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white shadow-glow ring-2 ring-background animate-glow-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                    )}
                  </Link>

                  {/* User dropdown */}
                  <div className="relative hidden md:block" ref={userMenuRef}>
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/40 py-1.5 pl-1.5 pr-3 text-sm transition-all hover:bg-secondary hover:border-border hover:shadow-card"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg gradient-primary text-[10px] font-bold text-white shadow-sm">
                        {currentUser.name[0]}
                      </div>
                      <span className="text-sm font-medium text-foreground max-w-[90px] truncate">{currentUser.name.split(" ")[0]}</span>
                      <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {userMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-58 rounded-2xl border border-border/60 bg-card p-1.5 shadow-floating animate-scale-in z-50">
                          <div className="px-3 py-2.5 border-b border-border/50 mb-1.5">
                            <p className="text-sm font-semibold text-foreground">{currentUser.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{currentUser.email}</p>
                            <Badge variant="outline" className="mt-1.5 text-[10px] capitalize border-primary/30 text-primary bg-primary/8">{currentUser.role}</Badge>
                          </div>
                          {hasRole(["USER", "PROVIDER"]) && (
                              <UserDropdownItem to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label={t("nav.myBookings")} onClick={() => setUserMenuOpen(false)} />
                          )}
                          {hasRole(["PROVIDER"]) && (
                              <UserDropdownItem to="/provider/profile" icon={<Settings className="h-4 w-4" />} label={t("nav.providerSettings")} onClick={() => setUserMenuOpen(false)} />
                          )}
                          <UserDropdownItem to="/notifications" icon={<Bell className="h-4 w-4" />} label={t("nav.notifications")} onClick={() => setUserMenuOpen(false)} badge={unreadCount > 0 ? unreadCount : undefined} />
                          <UserDropdownItem to="/settings" icon={<Settings className="h-4 w-4" />} label={t("nav.settings")} onClick={() => setUserMenuOpen(false)} />
                          <button
                              onClick={() => { resetData(); setUserMenuOpen(false); }}
                              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          >
                            <RotateCcw className="h-4 w-4" /> {t("nav.resetDemo")}
                          </button>
                          <div className="border-t border-border/50 mt-1 pt-1">
                            <button
                                onClick={() => { dispatch({ type: "LOGOUT" }); setUserMenuOpen(false); }}
                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                            >
                              <LogOut className="h-4 w-4" /> {t("nav.signOut")}
                            </button>
                          </div>
                        </div>
                    )}
                  </div>
                </>
            )}

            {!currentUser && (
                <div className="flex items-center gap-2">
                  <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground h-8"
                      onClick={resetData}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> {t("nav.reset")}
                  </Button>
                  <Link to="/auth/login">
                    <Button size="sm" className="h-8 rounded-xl gradient-primary text-white px-4 text-xs font-semibold btn-glow transition-all">
                      {t("nav.signIn")}
                    </Button>
                  </Link>
                </div>
            )}

            {/* Mobile hamburger */}
            <button
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground lg:hidden hover:bg-secondary transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
            <div className="border-t border-border/50 bg-card/95 backdrop-blur-xl px-4 py-3 lg:hidden animate-fade-in">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="mb-3 md:hidden">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                      placeholder={t("nav.searchShort")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 pl-9 rounded-xl bg-secondary/50 border-border/60"
                  />
                </div>
              </form>
              <div className="flex flex-col gap-0.5">
                <MobileNavItem to="/" icon={<Home className="h-4 w-4" />} label={t("nav.home")} onClick={() => setMenuOpen(false)} />
                <MobileNavItem to="/categories" icon={<Grid3X3 className="h-4 w-4" />} label={t("nav.providers")} onClick={() => setMenuOpen(false)} />
                {hasRole(["USER", "PROVIDER"]) && (
                    <MobileNavItem to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label={t("nav.myBookings")} onClick={() => setMenuOpen(false)} />
                )}
                {hasRole(["PROVIDER"]) && (
                    <MobileNavItem to="/provider/bookings" icon={<LayoutDashboard className="h-4 w-4" />} label={t("nav.providerPanel")} onClick={() => setMenuOpen(false)} />
                )}
                {hasRole(["ADMIN"]) && (
                    <MobileNavItem to="/admin/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label={t("nav.adminPanel")} onClick={() => setMenuOpen(false)} />
                )}
                {currentUser && (
                    <MobileNavItem to="/settings" icon={<Settings className="h-4 w-4" />} label={t("nav.settings")} onClick={() => setMenuOpen(false)} />
                )}
                {currentUser && (
                    <>
                      <div className="border-t border-border/50 my-1.5" />
                      <div className="flex items-center gap-2.5 px-3 py-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-primary text-xs font-bold text-white">{currentUser.name[0]}</div>
                        <div>
                          <p className="text-sm font-semibold">{currentUser.name}</p>
                          <Badge variant="outline" className="text-[10px] capitalize border-primary/30 text-primary">{currentUser.role}</Badge>
                        </div>
                      </div>
                      <button
                          onClick={() => { resetData(); setMenuOpen(false); }}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" /> {t("nav.resetDemo")}
                      </button>
                      <button
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => { dispatch({ type: "LOGOUT" }); setMenuOpen(false); }}
                      >
                        <LogOut className="h-4 w-4" /> {t("nav.signOut")}
                      </button>
                    </>
                )}
              </div>
            </div>
        )}
      </nav>
  );
}

function NavItem({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
      <Link
          to={to}
          className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
              active
                  ? "bg-primary/12 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
          }`}
      >
        {label}
      </Link>
  );
}

function MobileNavItem({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
      <Link
          to={to}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary/70"
          onClick={onClick}
      >
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </Link>
  );
}

function UserDropdownItem({ to, icon, label, onClick, badge }: { to: string; icon: React.ReactNode; label: string; onClick: () => void; badge?: number }) {
  return (
      <Link
          to={to}
          onClick={onClick}
          className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary/80"
      >
        <span className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground">{icon} <span className="text-foreground">{label}</span></span>
        {badge !== undefined && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full gradient-primary px-1.5 text-[10px] font-bold text-white shadow-glow">
          {badge}
        </span>
        )}
      </Link>
  );
}
