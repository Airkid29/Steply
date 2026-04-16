import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderOpen, User, Bookmark, Settings, LogOut, Menu, X, Bell, FileText, Mic, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { computeScore } from "@/lib/matchingEngine";
import { differenceInDays, parseISO } from "date-fns";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/applications", label: "Applications", icon: FolderOpen },
  { path: "/saved", label: "Saved", icon: Bookmark },
  { path: "/interview-prep", label: "Interview Prep", icon: Mic },
  { path: "/resume", label: "Resume", icon: FileText },
  { path: "/notifications", label: "Notifications", icon: Bell, badge: true },
  { path: "/profile", label: "Profile", icon: User },
  { path: "/settings", label: "Settings", icon: Settings },
];

function getStoredDismissed() {
  try { return new Set(JSON.parse(localStorage.getItem("steply_dismissed_notifs") || "[]")); } catch { return new Set(); }
}

function useNotificationCount(user) {
  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });
  const { data: opportunities = [] } = useQuery({
    queryKey: ["opportunities"],
    queryFn: () => base44.entities.Opportunity.list("-created_date", 100),
  });
  const { data: applications = [] } = useQuery({
    queryKey: ["applications", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Application.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const [dismissed, setDismissed] = useState(getStoredDismissed);

  useEffect(() => {
    const handleDismiss = () => setDismissed(getStoredDismissed());
    window.addEventListener('notificationsDismissed', handleDismiss);
    window.addEventListener('storage', handleDismiss);
    return () => {
      window.removeEventListener('notificationsDismissed', handleDismiss);
      window.removeEventListener('storage', handleDismiss);
    };
  }, []);

  const count = useMemo(() => {
    const savedIds = new Set((applications || []).map((a) => a.opportunity_id));
    let n = 0;
    (opportunities || []).forEach((opp) => {
      if (!opp.deadline) return;
      const deadline = typeof opp.deadline === "string" ? parseISO(opp.deadline) : opp.deadline;
      const daysLeft = differenceInDays(deadline, new Date());
      const isSaved = savedIds.has(String(opp.id));
      const score = computeScore(profile, opp).score;
      const deadlineId = `deadline-${opp.id}`;
      const matchId = `match-${opp.id}`;
      if (isSaved && daysLeft >= 0 && daysLeft <= 7 && !dismissed.has(deadlineId)) n++;
      if (!isSaved && score >= 75 && !dismissed.has(matchId)) n++;
    });
    return n;
  }, [opportunities, profile, applications, dismissed]);

  return count;
}

function NavLink({ item, active, onClick, notifCount }) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 pointer-events-auto ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
    >
      <item.icon className="w-[18px] h-[18px] shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge && notifCount > 0 && (
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${active ? "bg-white/25 text-white" : "bg-primary text-primary-foreground"}`}>
          {notifCount}
        </span>
      )}
    </Link>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const notifCount = useNotificationCount(user);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-[260px] border-r border-border bg-card z-30">
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary" />
          <span className="font-display font-bold text-lg">Steply</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} active={location.pathname === item.path} notifCount={notifCount} />
          ))}
          {user?.role === "admin" && (
            <NavLink item={{ path: "/admin", label: "Admin", icon: Shield }} active={location.pathname === "/admin"} notifCount={0} />
          )}
        </nav>
        <div className="p-4 border-t border-border space-y-1">
          <div className="flex items-center justify-between px-3.5 py-2">
            <span className="text-sm font-medium text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={() => base44.auth.logout("/")}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all w-full"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 bg-card/95 backdrop-blur-sm border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary" />
          <span className="font-display font-bold">Steply</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            {notifCount > 0 && !mobileOpen && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{notifCount}</span>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 right-0 w-64 bg-card border-l border-border h-full p-4 space-y-1 shadow-xl" onClick={(e) => e.stopPropagation()}>
            {navItems.map((item) => (
              <NavLink key={item.path} item={item} active={location.pathname === item.path} onClick={() => setMobileOpen(false)} notifCount={notifCount} />
            ))}
            {user?.role === "admin" && (
              <NavLink item={{ path: "/admin", label: "Admin", icon: Shield }} active={location.pathname === "/admin"} onClick={() => setMobileOpen(false)} notifCount={0} />
            )}
            <div className="pt-4 border-t border-border mt-4">
              <button
                onClick={() => base44.auth.logout("/")}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all w-full"
              >
                <LogOut className="w-[18px] h-[18px]" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-[260px] pt-14 lg:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 flex items-center justify-around px-2 py-1.5">
        {navItems.slice(0, 5).map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors pointer-events-auto ${active ? "text-primary" : "text-muted-foreground"}`}>
              <item.icon className="w-5 h-5" />
              {item.badge && notifCount > 0 && (
                <span className="absolute -top-0.5 right-0 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{notifCount}</span>
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}