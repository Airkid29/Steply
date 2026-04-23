import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, Loader2, ArrowLeft, ChevronRight, RefreshCw, RotateCcw, CheckCircle, Star } from "lucide-react";
import TypeBadge from "../components/shared/TypeBadge";
import SkeletonCard from "../components/shared/SkeletonCard";

// ---------------------------------------------------------------------------
// Question history — persisted per opportunity to avoid repeats across retries
// ---------------------------------------------------------------------------
const HISTORY_KEY = "steply_interview_history";

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}"); } catch { return {}; }
}

function appendHistory(oppId, questions) {
  const history = loadHistory();
  const prev = history[oppId] || [];
  const all = [...new Set([...prev, ...questions.map((q) => q.question)])].slice(-20);
  history[oppId] = all;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function getPreviousQuestions(oppId) {
  return loadHistory()[oppId] || [];
}

// ---------------------------------------------------------------------------
// Prompt builder — varies by opportunity type, profile depth, and retry count
// ---------------------------------------------------------------------------
const CATEGORY_MIXES = {
  scholarship:  ["motivation & purpose", "academic achievement", "community impact", "future vision", "personal challenge overcome"],
  hackathon:    ["technical problem-solving", "team collaboration under pressure", "past project or prototype", "creative thinking", "time-constraint decision making"],
  internship:   ["technical skill application", "behavioral / situational", "motivation for this role", "adaptability & learning", "initiative & ownership"],
  junior_job:   ["technical competency", "professional behavior", "problem-solving approach", "communication & collaboration", "long-term career vision"],
  competition:  ["domain knowledge depth", "competitive strategy", "resilience under failure", "analytical reasoning", "leadership or team role"],
};

function buildPrompt(opp, profile, retryCount, previousQuestions) {
  const oppType = opp.type || "internship";
  const categories = CATEGORY_MIXES[oppType] || CATEGORY_MIXES.internship;
  const level = profile?.academic_level?.replace(/_/g, " ") || "bachelor";
  const field = profile?.field_of_study || "general";
  const techSkills = (profile?.technical_skills || []).join(", ") || "none listed";
  const softSkills = (profile?.soft_skills || []).join(", ") || "none listed";
  const goals = (profile?.goals || []).join(", ") || "not specified";
  const requiredSkills = (opp.skills_needed || []).join(", ") || "none specified";

  const difficultyMap = ["moderate — fair for a student first attempt", "challenging — push deeper on reasoning", "very challenging — expect concrete examples and specifics"];
  const difficulty = difficultyMap[Math.min(retryCount, 2)];

  const avoidBlock = previousQuestions.length > 0
    ? `\nDo NOT repeat or closely paraphrase these previously asked questions:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n`
    : "";

  return `Generate exactly 5 interview questions for a student applying to the following opportunity. Each question must be distinct and specific — not generic.

OPPORTUNITY
- Title: ${opp.title}
- Type: ${oppType.replace(/_/g, " ")}
- Organizer: ${opp.organizer || "Unknown"}
- Description: ${opp.description || "N/A"}
- Required skills: ${requiredSkills}
- Requirements: ${(opp.requirements || []).join(", ") || "N/A"}

STUDENT PROFILE
- Field of study: ${field}
- Academic level: ${level}
- Technical skills: ${techSkills}
- Soft skills: ${softSkills}
- Goals: ${goals}

INSTRUCTIONS
- Difficulty level: ${difficulty}
- Assign each question a different category from this list (one per question): ${categories.join(", ")}
- Questions must be specific to a ${oppType.replace(/_/g, " ")} context — not generic HR filler
- Reference the student's actual skills and level in the framing where relevant
- The "tip" field must give a concrete, actionable strategy for this specific question (not generic advice like "be yourself" or "be confident")
- "category" field must match one of the five categories listed above exactly${avoidBlock}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
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
  const [retryCount, setRetryCount] = useState(0);
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

  const prepOpps = opportunities.filter((o) =>
    applications.some((a) => a.opportunity_id === String(o.id) && ["preparing", "applied", "saved"].includes(a.status))
  );

  const startSession = async (opp, isRetry = false) => {
    const nextRetry = isRetry ? retryCount + 1 : 0;
    setSelectedOpp(opp);
    setLoadingQuestions(true);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswer("");
    setFeedback(null);
    setSessionScores([]);
    setDone(false);
    setRetryCount(nextRetry);

    const previousQuestions = getPreviousQuestions(opp.id);
    const prompt = buildPrompt(opp, profile, nextRetry, previousQuestions);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
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

    const generated = res.questions || [];
    appendHistory(opp.id, generated);
    setQuestions(generated);
    setLoadingQuestions(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoadingFeedback(true);
    const q = questions[currentIdx];

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert interviewer evaluating a student's answer. Be constructive but honest.

Opportunity: ${selectedOpp?.title} (${selectedOpp?.type?.replace(/_/g, " ")})
Question category: ${q.category}
Question: ${q.question}
Student's answer: ${answer}

Student profile context:
- Level: ${profile?.academic_level?.replace(/_/g, " ") || "N/A"}
- Field: ${profile?.field_of_study || "N/A"}

Evaluate and provide:
1. A score from 1 to 10
2. What was strong in the answer (1-2 specific sentences)
3. The main thing to improve (1-2 specific, actionable sentences)
4. An ideal answer hint — 2-3 sentences showing the right angle, without writing the full answer`,
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

  const avgScore = sessionScores.length
    ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
    : 0;

  // --- Opportunity selection ---
  if (!selectedOpp) {
    return (
      <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Interview Prep</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Practice AI-generated questions tailored to your profile and each opportunity</p>
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
            <p className="font-medium text-sm">Generating questions{retryCount > 0 ? ` — session ${retryCount + 1}` : ""}...</p>
            <p className="text-xs text-muted-foreground">Tailored to {selectedOpp.title} and your profile</p>
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
          <h2 className="font-display text-2xl font-bold">Session complete</h2>
          <p className="text-muted-foreground">
            {questions.length} questions answered for <strong>{selectedOpp.title}</strong>
          </p>
          <div className={`text-5xl font-display font-bold ${scoreColor}`}>
            {avgScore}<span className="text-2xl text-muted-foreground">/10</span>
          </div>
          <p className="text-sm text-muted-foreground">Average score</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button onClick={() => startSession(selectedOpp, true)} variant="outline" className="rounded-xl gap-2">
              <RotateCcw className="w-4 h-4" /> New questions
            </Button>
            <Button onClick={() => { setSelectedOpp(null); setDone(false); }} className="rounded-xl gap-2">
              <RefreshCw className="w-4 h-4" /> Different opportunity
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Active session ---
  const currentQ = questions[currentIdx];
  const progress = (currentIdx / questions.length) * 100;

  return (
    <div className="space-y-5 animate-fade-in pb-20 lg:pb-0">
      <button onClick={() => setSelectedOpp(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between">
        <div>
          <TypeBadge type={selectedOpp.type} />
          <h2 className="font-semibold text-foreground mt-1">{selectedOpp.title}</h2>
        </div>
        <span className="text-sm text-muted-foreground font-medium">{currentIdx + 1}/{questions.length}</span>
      </div>

      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">{currentQ?.category || "Question"}</span>
        <p className="text-lg font-semibold text-foreground leading-snug">{currentQ?.question}</p>
        {currentQ?.tip && (
          <p className="text-xs text-muted-foreground bg-secondary/60 rounded-lg px-3 py-2">
            Tip: {currentQ.tip}
          </p>
        )}
      </div>

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
              <><Send className="w-4 h-4" /> Submit answer</>
            )}
          </Button>
        </div>
      )}

      {feedback && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
            <div className="flex gap-0.5">
              {[...Array(10)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < feedback.score ? "fill-amber-400 text-amber-400" : "text-border"}`} />
              ))}
            </div>
            <span className="font-bold text-foreground">{feedback.score}/10</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">What was good</p>
            <p className="text-sm text-emerald-900">{feedback.what_was_good}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">To improve</p>
            <p className="text-sm text-amber-900">{feedback.improvement}</p>
          </div>

          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Ideal answer direction</p>
            <p className="text-sm text-foreground/80">{feedback.ideal_hint}</p>
          </div>

          <Button onClick={nextQuestion} className="w-full rounded-xl h-11 gap-2">
            {currentIdx + 1 >= questions.length ? "See results" : "Next question"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
