import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, BookmarkCheck, MapPin, ExternalLink, FileText, MessageSquare, CheckCircle, Loader2, Globe, Mic, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import TypeBadge from "../components/shared/TypeBadge";
import MatchScore from "../components/shared/MatchScore";
import DeadlineBadge from "../components/shared/DeadlineBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { computeScore, generateExplanation } from "../lib/matchingEngine";

export default function OpportunityDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const id = window.location.pathname.split("/").pop();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [actionPlan, setActionPlan] = useState(null);
  const [letter, setLetter] = useState(null);

  useEffect(() => { mockClient.auth.me().then(setUser); }, []);

  const { data: opportunity, isLoading } = useQuery({
    queryKey: ["opportunity", id],
    queryFn: async () => {
      const all = await mockClient.entities.Opportunity.list();
      return all.find((o) => String(o.id) === String(id));
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.email],
    queryFn: async () => {
      const profiles = await mockClient.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["applications", user?.email],
    queryFn: () => mockClient.entities.Application.filter({ created_by: user.email }),
    enabled: !!user?.email,
  });

  const existingApp = applications.find((a) => a.opportunity_id === String(id));
  const matchData = useMemo(() => computeScore(profile, opportunity), [profile, opportunity]);
  const explanation = useMemo(
    () => opportunity ? generateExplanation(profile || {}, opportunity, matchData) : "",
    [profile, opportunity, matchData]
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (existingApp) {
        await mockClient.entities.Application.delete(existingApp.id);
      } else {
        await mockClient.entities.Application.create({
          opportunity_id: String(opportunity.id),
          opportunity_title: opportunity.title,
          opportunity_type: opportunity.type,
          opportunity_deadline: opportunity.deadline,
          compatibility_score: matchData.score,
          ai_explanation: explanation,
          status: "saved",
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });

  const generateActionPlan = async () => {
    setGeneratingPlan(true);
    const res = await mockClient.integrations.Core.InvokeLLM({
      prompt: `You are a helpful student career assistant. Generate a concise, practical action plan for a student applying to this opportunity.

Opportunity: ${opportunity.title} (${opportunity.type})
Description: ${opportunity.description || "N/A"}
Requirements: ${(opportunity.requirements || []).join(", ") || "N/A"}
Deadline: ${opportunity.deadline || "N/A"}

Student profile:
- Field: ${profile?.field_of_study || "N/A"}
- Level: ${profile?.academic_level || "N/A"}
- Skills: ${[...(profile?.technical_skills || []), ...(profile?.soft_skills || [])].join(", ") || "N/A"}

Give me 5-7 clear action steps. Be specific and student-friendly. Include deadline awareness. No corporate jargon.`,
      response_json_schema: {
        type: "object",
        properties: {
          steps: { type: "array", items: { type: "string" } },
          missing_requirements: { type: "array", items: { type: "string" } },
          priority_tip: { type: "string" },
        },
      },
    });
    setActionPlan(res);
    setGeneratingPlan(false);
  };

  const generateMotivationLetter = async () => {
    setGeneratingLetter(true);
    const res = await mockClient.integrations.Core.InvokeLLM({
      prompt: `Write a short, compelling motivation letter draft for a student applying to:

Opportunity: ${opportunity.title} (${opportunity.type})
Organizer: ${opportunity.organizer || "N/A"}
Description: ${opportunity.description || "N/A"}

Student:
- Name: ${profile?.name || "Student"}
- Field: ${profile?.field_of_study || "N/A"}
- Level: ${profile?.academic_level?.replace(/_/g, " ") || "N/A"}
- Skills: ${[...(profile?.technical_skills || [])].join(", ") || "N/A"}
- Goals: ${(profile?.goals || []).join(", ") || "N/A"}

Write 3-4 paragraphs. Be authentic, enthusiastic, and specific. Sound like a real student, not a robot. No clichés.`,
    });
    setLetter(res);
    setGeneratingLetter(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Opportunity not found</p>
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mt-4">Go back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <TypeBadge type={opportunity.type} size="lg" />
            <DeadlineBadge deadline={opportunity.deadline} />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">{opportunity.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            {opportunity.organizer && <span>{opportunity.organizer}</span>}
            {opportunity.country && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {opportunity.is_remote ? "Remote" : opportunity.country}
              </span>
            )}
            {opportunity.is_remote && (
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                Remote
              </span>
            )}
          </div>
        </div>
        <MatchScore score={matchData.score} size="lg" />
      </div>

      {/* Match explanation */}
      <div className="bg-primary/5 border border-primary/15 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm mb-1">Why this matches you</h3>
            <p className="text-sm text-foreground/80 mb-3">{explanation}</p>
            {matchData.reasons.length > 0 && (
              <ul className="space-y-1">
                {matchData.reasons.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground/70">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            )}
            {matchData.risk && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
                ⚠️ {matchData.risk}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {opportunity.description && (
        <div>
          <h3 className="font-semibold text-sm mb-2">About this opportunity</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{opportunity.description}</p>
        </div>
      )}

      {/* Requirements */}
      {opportunity.requirements?.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-2">Requirements</h3>
          <ul className="space-y-1.5">
            {opportunity.requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => saveMutation.mutate()} variant={existingApp ? "secondary" : "default"} className="rounded-xl">
          {existingApp ? <BookmarkCheck className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
          {existingApp ? "Saved" : "Save opportunity"}
        </Button>
        {opportunity.url && (
          <Button variant="outline" className="rounded-xl" asChild>
            <a href={opportunity.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit website
            </a>
          </Button>
        )}
        <Button variant="outline" className="rounded-xl" asChild>
          <Link to="/interview-prep">
            <Mic className="w-4 h-4 mr-2" />
            Interview Prep
          </Link>
        </Button>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => {
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({ title: opportunity.title, url });
            } else {
              navigator.clipboard.writeText(url);
              toast({ title: "Lien copié !", description: "Partagez cette opportunité avec vos amis." });
            }
          }}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Partager
        </Button>
      </div>

      {/* AI Action Plan */}
      <div className="border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Action Plan
          </h3>
          {!actionPlan && (
            <Button size="sm" variant="outline" onClick={generateActionPlan} disabled={generatingPlan} className="rounded-lg text-xs">
              {generatingPlan ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : null}
              Generate
            </Button>
          )}
        </div>
        {generatingPlan && (
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Generating your personalized action plan...</span>
          </div>
        )}
        {actionPlan && (
          <div className="space-y-4">
            <ol className="space-y-2">
              {actionPlan.steps?.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            {actionPlan.priority_tip && (
              <p className="text-xs text-primary bg-primary/5 rounded-lg p-3">💡 {actionPlan.priority_tip}</p>
            )}
          </div>
        )}
        {!actionPlan && !generatingPlan && (
          <p className="text-sm text-muted-foreground">Get a step-by-step plan tailored to your profile.</p>
        )}
      </div>

      {/* Motivation letter */}
      <div className="border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Motivation Letter Draft
          </h3>
          {!letter && (
            <Button size="sm" variant="outline" onClick={generateMotivationLetter} disabled={generatingLetter} className="rounded-lg text-xs">
              {generatingLetter ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : null}
              Generate
            </Button>
          )}
        </div>
        {generatingLetter && (
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Writing your motivation letter...</span>
          </div>
        )}
        {letter && (
          <div className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed bg-secondary/50 rounded-lg p-4">
            {letter}
          </div>
        )}
        {!letter && !generatingLetter && (
          <p className="text-sm text-muted-foreground">Get an AI-drafted cover letter based on your profile.</p>
        )}
      </div>
    </div>
  );
}