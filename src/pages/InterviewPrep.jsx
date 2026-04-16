import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, Loader2, ArrowLeft, ChevronRight, RefreshCw, RotateCcw, CheckCircle, Star } from "lucide-react";
import TypeBadge from "../components/shared/TypeBadge";
import SkeletonCard from "../components/shared/SkeletonCard";

export default function InterviewPrep() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [sessionScores, setSessionScores] = useState([]);
  const [done, setDone] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)); }, []);

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ["applications", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Application.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ["opportunities"],
    queryFn: () => base44.entities.Opportunity.list("-created_date", 100),
  });

  // Only show saved/preparing/applied opps
  const prepOpps = opportunities.filter((o) =>
    applications.some((a) => a.opportunity_id === String(o.id) && ["preparing", "applied", "saved"].includes(a.status))
  );

  const startSession = async (opp) => {
    setSelectedOpp(opp);
    setLoadingQuestions(true);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswer("");
    setFeedback(null);
    setSessionScores([]);
    setDone(false);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 5 realistic interview questions for a student applying to:

Opportunity: ${opp.title} (${opp.type}) by ${opp.organizer || "Unknown"}
Description: ${opp.description || "N/A"}
Requirements: ${(opp.requirements || []).join(", ") || "N/A"}

Student profile:
- Field: ${profile?.field_of_study || "N/A"}
- Level: ${profile?.academic_level?.replace(/_/g, " ") || "N/A"}
- Skills: ${[...(profile?.technical_skills || []), ...(profile?.soft_skills || [])].join(", ") || "N/A"}

Mix behavioral (tell me about...), technical, and motivation questions relevant to this specific opportunity. Make them realistic and challenging but fair for a student.`,
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                category: { type: "string" },
                tip: { type: "string" },
              },
            },
          },
        },
      },
    });

    setQuestions(res.questions || []);
    setLoadingQuestions(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoadingFeedback(true);
    const q = questions[currentIdx];

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert interviewer giving feedback to a student.

Question: ${q.question}
Student's Answer: ${answer}

Evaluate the answer and provide:
1. A score from 1-10
2. What was good (1-2 sentences)
3. What to improve (1-2 sentences)  
4. An ideal answer hint (2-3 sentences, not a full script)`,
      response_json_schema: {
        type: "object",
        properties: {
          score: { type: "number" },
          what_was_good: { type: "string" },
          improvement: { type: "string" },
          ideal_hint: { type: "string" },
        },
      },
    });

    setFeedback(res);
    setSessionScores((prev) => [...prev, res.score]);
    setLoadingFeedback(false);
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setAnswer("");
      setFeedback(null);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const avgScore = sessionScores.length ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length) : 0;

  // --- Opportunity Selection ---
  if (!selectedOpp) {
    return (
      <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Interview Prep</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Practice AI-generated questions for your saved opportunities</p>
        </div>

        {loadingApps ? (
          <div className="space-y-3">{Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : prepOpps.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
              <Mic className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No saved opportunities yet</p>
            <p className="text-sm text-muted-foreground">Save opportunities from the dashboard to start interview prep.</p>
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="rounded-xl mt-2">
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {prepOpps.map((opp) => (
              <button
                key={opp.id}
                onClick={() => startSession(opp)}
                className="w-full text-left bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <TypeBadge type={opp.type} />
                    <h3 className="font-semibold text-foreground mt-2 mb-0.5">{opp.title}</h3>
                    <p className="text-sm text-muted-foreground">{opp.organizer || "—"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <span className="text-xs text-primary font-medium">Start prep</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- Loading questions ---
  if (loadingQuestions) {
    return (
      <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
        <button onClick={() => setSelectedOpp(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-6 flex items-center gap-4">
          <Loader2 className="w-6 h-6 text-primary animate-spin shrink-0" />
          <div>
            <p className="font-medium text-sm">Generating interview questions...</p>
            <p className="text-xs text-muted-foreground">Tailored to {selectedOpp.title}</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Session complete ---
  if (done) {
    const scoreColor = avgScore >= 8 ? "text-emerald-600" : avgScore >= 6 ? "text-amber-600" : "text-rose-600";
    return (
      <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
        <div className="text-center py-10 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold">Session Complete!</h2>
          <p className="text-muted-foreground">You answered {questions.length} questions for <strong>{selectedOpp.title}</strong></p>
          <div className={`text-5xl font-display font-bold ${scoreColor}`}>{avgScore}<span className="text-2xl text-muted-foreground">/10</span></div>
          <p className="text-sm text-muted-foreground">Average score across all answers</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button onClick={() => startSession(selectedOpp)} variant="outline" className="rounded-xl gap-2">
              <RotateCcw className="w-4 h-4" /> Try again
            </Button>
            <Button onClick={() => { setSelectedOpp(null); setDone(false); }} className="rounded-xl gap-2">
              <RefreshCw className="w-4 h-4" /> New opportunity
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Active session ---
  const currentQ = questions[currentIdx];
  const progress = ((currentIdx) / questions.length) * 100;

  return (
    <div className="space-y-5 animate-fade-in pb-20 lg:pb-0">
      <button onClick={() => setSelectedOpp(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <TypeBadge type={selectedOpp.type} />
          <h2 className="font-semibold text-foreground mt-1">{selectedOpp.title}</h2>
        </div>
        <span className="text-sm text-muted-foreground font-medium">{currentIdx + 1}/{questions.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">{currentQ?.category || "Question"}</span>
        </div>
        <p className="text-lg font-semibold text-foreground leading-snug">{currentQ?.question}</p>
        {currentQ?.tip && (
          <p className="text-xs text-muted-foreground bg-secondary/60 rounded-lg px-3 py-2">
            💡 Tip: {currentQ.tip}
          </p>
        )}
      </div>

      {/* Answer */}
      {!feedback && (
        <div className="space-y-3">
          <Textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[140px] rounded-xl resize-none text-sm"
            disabled={loadingFeedback}
          />
          <Button
            onClick={submitAnswer}
            disabled={!answer.trim() || loadingFeedback}
            className="w-full rounded-xl h-11 gap-2"
          >
            {loadingFeedback ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</>
            ) : (
              <><Send className="w-4 h-4" /> Submit Answer</>
            )}
          </Button>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className="space-y-4 animate-fade-in">
          {/* Score */}
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
            <div className="flex gap-0.5">
              {[...Array(10)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < feedback.score ? "fill-amber-400 text-amber-400" : "text-border"}`} />
              ))}
            </div>
            <span className="font-bold text-foreground">{feedback.score}/10</span>
          </div>

          {/* Good */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">What was good</p>
            <p className="text-sm text-emerald-900">{feedback.what_was_good}</p>
          </div>

          {/* Improve */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">To improve</p>
            <p className="text-sm text-amber-900">{feedback.improvement}</p>
          </div>

          {/* Ideal hint */}
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Ideal answer hint</p>
            <p className="text-sm text-foreground/80">{feedback.ideal_hint}</p>
          </div>

          <Button onClick={nextQuestion} className="w-full rounded-xl h-11 gap-2">
            {currentIdx + 1 >= questions.length ? "See Results" : "Next Question"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}