import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import TypeBadge from "../components/shared/TypeBadge";
import DeadlineBadge from "../components/shared/DeadlineBadge";
import MatchScore from "../components/shared/MatchScore";
import EmptyState from "../components/shared/EmptyState";
import SkeletonCard from "../components/shared/SkeletonCard";

export default function Saved() {
  const [user, setUser] = useState(null);
  useEffect(() => { mockClient.auth.me().then(setUser); }, []);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications", user?.email],
    queryFn: () => mockClient.entities.Application.filter({ created_by: user.email }, "-created_date"),
    enabled: !!user?.email,
  });

  const saved = applications.filter((a) => a.status === "saved");

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-display font-bold">Saved</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Opportunities you bookmarked</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved opportunities"
          description="Tap the bookmark icon on any opportunity to save it for later."
          actionLabel="Browse opportunities"
          onAction={() => window.location.href = "/dashboard"}
        />
      ) : (
        <div className="space-y-3">
          {saved.map((app) => (
            <Link key={app.id} to={`/opportunity/${app.opportunity_id}`} className="block bg-card rounded-xl border border-border p-4 hover:border-primary/20 transition-all">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <TypeBadge type={app.opportunity_type} />
                    <DeadlineBadge deadline={app.opportunity_deadline} />
                  </div>
                  <h3 className="font-medium text-foreground line-clamp-1">{app.opportunity_title}</h3>
                  {app.ai_explanation && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{app.ai_explanation}</p>}
                </div>
                {app.compatibility_score && <MatchScore score={app.compatibility_score} size="sm" />}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}