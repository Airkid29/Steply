import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import OpportunityCard from "../components/dashboard/OpportunityCard";
import FilterBar from "../components/dashboard/FilterBar";
import ProfileCompletion from "../components/dashboard/ProfileCompletion";
import SkeletonCard from "../components/shared/SkeletonCard";
import EmptyState from "../components/shared/EmptyState";
import { computeScore, generateExplanation } from "../lib/matchingEngine";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [user, setUser] = useState(null);
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!user?.email || checkedOnboarding) return;
    base44.entities.UserProfile.filter({ created_by: user.email }).then((profiles) => {
      if (!profiles.length || !profiles[0].onboarding_completed) {
        navigate("/onboarding", { replace: true });
      }
      setCheckedOnboarding(true);
    }).catch(() => setCheckedOnboarding(true));
  }, [user?.email]);

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: opportunities = [], isLoading: loadingOpps } = useQuery({
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

  const savedIds = useMemo(() => new Set(applications.map((a) => a.opportunity_id)), [applications]);

  const scoredOpps = useMemo(() => {
    return opportunities
      .map((opp) => {
        const matchData = computeScore(profile, opp);
        const explanation = generateExplanation(profile || {}, opp, matchData);
        return { opportunity: opp, ...matchData, explanation };
      })
      .sort((a, b) => b.score - a.score);
  }, [opportunities, profile]);

  const filtered = useMemo(() => {
    return scoredOpps.filter((item) => {
      if (activeType !== "all" && item.opportunity.type !== activeType) return false;
      if (search) {
        const q = search.toLowerCase();
        const opp = item.opportunity;
        return (
          opp.title?.toLowerCase().includes(q) ||
          opp.organizer?.toLowerCase().includes(q) ||
          opp.country?.toLowerCase().includes(q) ||
          opp.domains?.some((d) => d.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [scoredOpps, activeType, search]);

  const saveMutation = useMutation({
    mutationFn: async (opp) => {
      const existing = applications.find((a) => a.opportunity_id === String(opp.id));
      if (existing) {
        await base44.entities.Application.delete(existing.id);
      } else {
        const matchData = computeScore(profile, opp);
        await base44.entities.Application.create({
          opportunity_id: String(opp.id),
          opportunity_title: opp.title,
          opportunity_type: opp.type,
          opportunity_deadline: opp.deadline,
          compatibility_score: matchData.score,
          ai_explanation: generateExplanation(profile || {}, opp, matchData),
          status: "saved",
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });

  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      {/* Welcome */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Hey {firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Here are your top matches today</p>
      </div>

      {/* Profile completion */}
      <ProfileCompletion profile={profile} />

      {/* Filters */}
      <FilterBar search={search} onSearchChange={setSearch} activeType={activeType} onTypeChange={setActiveType} />

      {/* Results */}
      <div className="space-y-3">
        {loadingOpps ? (
          Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No opportunities found"
            description={search ? "Try a different search term" : "Check back soon — we're always adding new opportunities."}
            actionLabel={search ? "Clear search" : undefined}
            onAction={search ? () => setSearch("") : undefined}
          />
        ) : (
          filtered.map((item) => (
            <OpportunityCard
              key={item.opportunity.id}
              opportunity={item.opportunity}
              score={item.score}
              explanation={item.explanation}
              isSaved={savedIds.has(String(item.opportunity.id))}
              onToggleSave={() => saveMutation.mutate(item.opportunity)}
            />
          ))
        )}
      </div>
    </div>
  );
}