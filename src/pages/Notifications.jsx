import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Bell, Clock, Trophy, Briefcase, GraduationCap, Code2, ArrowRight, CheckCheck, X } from "lucide-react";
import { Link } from "react-router-dom";
import { differenceInDays, format, parseISO } from "date-fns";
import { computeScore } from "../lib/matchingEngine";
import SkeletonCard from "../components/shared/SkeletonCard";
import BackButton from "../components/shared/BackButton";

function buildNotifications(opportunities, profile, applications) {
  const savedIds = new Set((applications || []).map((a) => a.opportunity_id));
  const notes = [];

  (opportunities || []).forEach((opp) => {
    if (!opp.deadline) return;
    const deadline = typeof opp.deadline === "string" ? parseISO(opp.deadline) : opp.deadline;
    const daysLeft = differenceInDays(deadline, new Date());
    const isSaved = savedIds.has(String(opp.id));
    const matchData = computeScore(profile, opp);
    const score = matchData.score;

    if (isSaved && daysLeft >= 0 && daysLeft <= 7) {
      notes.push({
        id: `deadline-${opp.id}`,
        type: "deadline",
        urgency: daysLeft <= 2 ? "high" : "medium",
        title: daysLeft === 0 ? "Deadline today!" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`,
        body: `"${opp.title}" deadline is approaching. Don't miss it!`,
        oppId: opp.id,
        oppType: opp.type,
        time: daysLeft === 0 ? "Today" : `in ${daysLeft}d`,
      });
    }

    if (!isSaved && score >= 75) {
      notes.push({
        id: `match-${opp.id}`,
        type: "match",
        urgency: "low",
        title: `${score}% match found`,
        body: `"${opp.title}" by ${opp.organizer || "Unknown"} looks like a great fit for you.`,
        oppId: opp.id,
        oppType: opp.type,
        time: opp.deadline ? format(parseISO(opp.deadline), "MMM d") : "Open",
      });
    }
  });

  const order = { high: 0, medium: 1, low: 2 };
  return notes.sort((a, b) => order[a.urgency] - order[b.urgency]);
}

const typeIcons = {
  scholarship: GraduationCap,
  hackathon: Code2,
  internship: Briefcase,
  junior_job: Briefcase,
  competition: Trophy,
};

const urgencyStyles = {
  high: { dot: "bg-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800", icon: "text-rose-500" },
  medium: { dot: "bg-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800", icon: "text-amber-500" },
  low: { dot: "bg-primary", bg: "bg-card border-border", icon: "text-primary" },
};

function getStoredDismissed() {
  try { return new Set(JSON.parse(localStorage.getItem("steply_dismissed_notifs") || "[]")); } catch { return new Set(); }
}

export default function Notifications() {
  const [user, setUser] = useState(null);
  const [dismissed, setDismissed] = useState(getStoredDismissed);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const handleDismiss = () => setDismissed(getStoredDismissed());
    window.addEventListener('notificationsDismissed', handleDismiss);
    window.addEventListener('storage', handleDismiss);
    return () => {
      window.removeEventListener('notificationsDismissed', handleDismiss);
      window.removeEventListener('storage', handleDismiss);
    };
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: opportunities = [], isLoading } = useQuery({
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

  const allNotifications = useMemo(() => buildNotifications(opportunities, profile, applications), [opportunities, profile, applications]);
  const notifications = useMemo(() => allNotifications.filter((n) => !dismissed.has(n.id)), [allNotifications, dismissed]);

  const dismiss = (id, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const updated = new Set([...dismissed, id]);
    setDismissed(updated);
    localStorage.setItem("steply_dismissed_notifs", JSON.stringify([...updated]));
    window.dispatchEvent(new CustomEvent('notificationsDismissed', { detail: { dismissed: updated } }));
  };

  const dismissAll = () => {
    const all = new Set(notifications.map((n) => n.id));
    const updated = new Set([...dismissed, ...all]);
    setDismissed(updated);
    localStorage.setItem("steply_dismissed_notifs", JSON.stringify([...updated]));
    window.dispatchEvent(new CustomEvent('notificationsDismissed', { detail: { dismissed: updated } }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <BackButton className="mt-1" />
          <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            Notifications
            {notifications.length > 0 && (
              <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">{notifications.length}</span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Deadlines, high matches, and important updates</p>
          </div>
        </div>
        {notifications.length > 0 && (
          <button onClick={dismissAll} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <CheckCheck className="w-3.5 h-3.5" />
            Dismiss all
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <p className="font-medium text-foreground">All caught up!</p>
          <p className="text-sm">No urgent deadlines or new high-match opportunities right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const styles = urgencyStyles[n.urgency];
            const TypeIcon = typeIcons[n.oppType] || Bell;

            return (
              <div key={n.id} className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-sm ${styles.bg}`}>
                <Link to={`/opportunity/${n.oppId}`} className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-card border border-border flex items-center justify-center shadow-sm">
                      <TypeIcon className={`w-5 h-5 ${styles.icon}`} />
                    </div>
                    <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${styles.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-foreground">{n.title}</span>
                      {n.type === "deadline" && <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug">{n.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-3" />
                </Link>
                <button
                  onClick={(e) => dismiss(n.id, e)}
                  className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}