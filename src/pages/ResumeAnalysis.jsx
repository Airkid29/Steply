import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import mockClient from "@/api/mockClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, ChevronRight, RefreshCw } from "lucide-react";

export default function ResumeAnalysis() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => { mockClient.auth.me().then(setUser); }, []);

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.email],
    queryFn: async () => {
      const profiles = await mockClient.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const handleFile = (f) => {
    if (!f) return;
    const valid = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"].includes(f.type);
    if (!valid) { setError("Please upload a PDF, Word, or text file."); return; }
    setFile(f);
    setError(null);
    setAnalysis(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const analyzeResume = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    const uploadRes = await mockClient.integrations.Core.UploadFile({ file });
    const fileUrl = uploadRes.file_url;
    setUploading(false);
    setAnalyzing(true);

    const res = await mockClient.integrations.Core.InvokeLLM({
      prompt: `You are an expert career advisor for students. Analyze this resume and provide detailed, actionable feedback.

Student profile context:
- Field of study: ${profile?.field_of_study || "N/A"}
- Academic level: ${profile?.academic_level?.replace(/_/g, " ") || "N/A"}
- Goals: ${(profile?.goals || []).join(", ") || "N/A"}

Analyze the resume and return a structured report with:
1. An overall score (0-100) 
2. Top 3 strengths
3. Top 3 specific improvements needed
4. Missing keywords/skills for their field
5. A one-line summary verdict
6. Skills found in the resume (list)`,
      file_urls: [fileUrl],
      response_json_schema: {
        type: "object",
        properties: {
          overall_score: { type: "number" },
          summary: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          improvements: { type: "array", items: { type: "string" } },
          missing_keywords: { type: "array", items: { type: "string" } },
          skills_found: { type: "array", items: { type: "string" } },
          profile_sync_tip: { type: "string" },
        },
      },
    });

    setAnalysis(res);
    setAnalyzing(false);

    // Auto-update profile skills if found
    if (res.skills_found?.length > 0 && profile) {
      const existing = new Set(profile.technical_skills || []);
      const newSkills = res.skills_found.filter((s) => !existing.has(s));
      if (newSkills.length > 0) {
        const merged = [...(profile.technical_skills || []), ...newSkills];
        await mockClient.entities.UserProfile.update(profile.id, { technical_skills: merged });
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      }
    }
  };

  const scoreColor = analysis?.overall_score >= 75 ? "text-emerald-600" : analysis?.overall_score >= 50 ? "text-amber-600" : "text-rose-600";
  const scoreRing = analysis?.overall_score >= 75 ? "stroke-emerald-500" : analysis?.overall_score >= 50 ? "stroke-amber-500" : "stroke-rose-500";

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Resume Analysis</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Upload your resume and get instant AI-powered feedback</p>
      </div>

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer ${
          dragging ? "border-primary bg-primary/5" : file ? "border-primary/40 bg-primary/3" : "border-border hover:border-primary/40 hover:bg-secondary/50"
        }`}
        onClick={() => document.getElementById("resume-input").click()}
      >
        <input
          id="resume-input"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="flex flex-col items-center gap-3">
          {file ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB — click to change</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                <Upload className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Drop your resume here</p>
                <p className="text-sm text-muted-foreground">PDF, Word, or TXT — up to 10MB</p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {file && !analysis && (
        <Button onClick={analyzeResume} disabled={uploading || analyzing} className="w-full rounded-xl h-11" size="lg">
          {uploading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
          ) : analyzing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing your resume...</>
          ) : (
            <>Analyze Resume</>
          )}
        </Button>
      )}

      {analyzing && (
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-5 flex items-center gap-4">
          <Loader2 className="w-6 h-6 text-primary animate-spin shrink-0" />
          <div>
            <p className="font-medium text-sm">AI is reading your resume...</p>
            <p className="text-xs text-muted-foreground">This takes about 10–15 seconds</p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-5 animate-fade-in">
          {/* Score + Summary */}
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-6">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-secondary" />
                <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.5" strokeDasharray={`${analysis.overall_score} 100`} strokeLinecap="round" className={scoreRing} />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold font-display ${scoreColor}`}>
                {analysis.overall_score}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Resume Score</p>
              <p className="font-semibold text-foreground">{analysis.summary}</p>
              {analysis.profile_sync_tip && (
                <p className="text-xs text-primary mt-1.5">✨ {analysis.profile_sync_tip}</p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {analysis.strengths?.map((s, i) => (
                  <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-amber-500" />
                Improvements
              </h3>
              <ul className="space-y-2">
                {analysis.improvements?.map((s, i) => (
                  <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing keywords */}
          {analysis.missing_keywords?.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                Missing Keywords & Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_keywords.map((kw, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-medium">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Skills found */}
          {analysis.skills_found?.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-3">
                Skills Detected
                <span className="text-xs text-muted-foreground font-normal ml-1">— added to your profile</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.skills_found.map((sk, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">{sk}</span>
                ))}
              </div>
            </div>
          )}

          <Button variant="outline" onClick={() => { setFile(null); setAnalysis(null); }} className="rounded-xl gap-2">
            <RefreshCw className="w-4 h-4" />
            Analyze another resume
          </Button>
        </div>
      )}
    </div>
  );
}