import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import TypeBadge from "../components/shared/TypeBadge";
import StatusBadge from "../components/shared/StatusBadge";
import DeadlineBadge from "../components/shared/DeadlineBadge";
import MatchScore from "../components/shared/MatchScore";
import EmptyState from "../components/shared/EmptyState";
import SkeletonCard from "../components/shared/SkeletonCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statuses = ["all", "saved", "preparing", "applied", "archived"];

export default function Applications() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)); }, []);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Application.filter({ created_by: user.email }, "-created_date");
    },
    enabled: !!user?.email,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Application.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });

  const filtered = statusFilter === "all" ? applications : applications.filter((a) => a.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">My Applications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{applications.length} tracked opportunit{applications.length === 1 ? "y" : "ies"}</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={statusFilter === "all" ? "No applications yet" : `No ${statusFilter} applications`}
          description="Save opportunities from the dashboard to start tracking them here."
          actionLabel="Browse opportunities"
          onAction={() => window.location.href = "/dashboard"}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div key={app.id} className="bg-card rounded-xl border border-border p-4 hover:border-primary/20 transition-all">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <TypeBadge type={app.opportunity_type} />
                    <StatusBadge status={app.status} />
                  </div>
                  <Link to={`/opportunity/${app.opportunity_id}`} className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1 block">
                    {app.opportunity_title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1.5">
                    <DeadlineBadge deadline={app.opportunity_deadline} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {app.compatibility_score && <MatchScore score={app.compatibility_score} size="sm" />}
                  <Select value={app.status} onValueChange={(v) => updateStatus.mutate({ id: app.id, status: v })}>
                    <SelectTrigger className="h-7 text-xs rounded-lg w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saved">Saved</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}