import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { queryClientInstance } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Plus, X, CheckCircle, Globe } from "lucide-react";
import { ALL_COUNTRIES } from "@/lib/countries";
import { OPPORTUNITY_DOMAINS } from "@/lib/sectors";
import { useToast } from "@/components/ui/use-toast";

const TYPES = [
  { value: "scholarship", label: "Scholarship" },
  { value: "hackathon", label: "Hackathon" },
  { value: "internship", label: "Internship" },
  { value: "junior_job", label: "Junior Job" },
  { value: "competition", label: "Competition" },
];

const LEVELS = [
  { value: "any", label: "Any level" },
  { value: "high_school", label: "High School" },
  { value: "bachelor", label: "Bachelor" },
  { value: "master", label: "Master" },
  { value: "phd", label: "PhD" },
];

function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) { onChange([...tags, t]); setInput(""); }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder} className="h-9 rounded-lg flex-1" />
        <Button type="button" variant="outline" size="sm" onClick={add} className="h-9 rounded-lg"><Plus className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
}

export default function RecruiterPost() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: "", type: "", organizer: "", description: "", url: "",
    country: "", is_remote: false, level: "any", deadline: "",
    requirements: [], skills_needed: [], domains: [],
  });

  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)); }, []);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.type || !form.organizer) {
      toast({ title: "Missing fields", description: "Please fill title, type, and organizer.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const payload = { ...form };
    if (!payload.deadline) delete payload.deadline;
    await base44.entities.Opportunity.create(payload);
    queryClientInstance.invalidateQueries({ queryKey: ["opportunities"] });
    window.dispatchEvent(new Event('opportunityChanged'));
    setSubmitting(false);
    setSubmitted(true);
    toast({ title: "Opportunity posted!", description: "Your listing is now live on Steply." });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="font-display text-2xl font-bold">Opportunity Posted!</h2>
          <p className="text-muted-foreground text-sm">Your listing is now live and visible to students on Steply.</p>
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={() => { setSubmitted(false); setForm({ title: "", type: "", organizer: "", description: "", url: "", country: "", is_remote: false, level: "any", deadline: "", requirements: [], skills_needed: [], domains: [] }); }} className="rounded-xl">
              Post another opportunity
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="rounded-xl">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary" />
            <span className="font-display font-bold text-xl">Steply</span>
            <span className="text-muted-foreground text-sm ml-1">· For Recruiters</span>
          </div>
          {!user && (
            <Button variant="outline" onClick={() => base44.auth.redirectToLogin()} className="rounded-full h-9 text-sm">
              Sign in
            </Button>
          )}
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Briefcase className="w-3.5 h-3.5" />
              Recruiter Portal
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Post an Opportunity</h1>
            <p className="text-muted-foreground">Reach thousands of qualified students matched by AI to your listing.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic info */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-sm text-foreground">Basic Information</h2>
              <div>
                <Label className="text-xs mb-1.5 block">Opportunity title *</Label>
                <Input value={form.title} onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Frontend Internship at Acme Corp" className="h-10 rounded-lg" required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1.5 block">Type *</Label>
                  <Select value={form.type} onValueChange={(v) => set("type", v)}>
                    <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Organizer / Company *</Label>
                  <Input value={form.organizer} onChange={(e) => set("organizer", e.target.value)}
                    placeholder="e.g. Acme Corp" className="h-10 rounded-lg" required />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Website / Application URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={form.url} onChange={(e) => set("url", e.target.value)}
                    placeholder="https://example.com/apply" className="h-10 rounded-lg pl-9" type="url" />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-sm text-foreground">Details</h2>
              <div>
                <Label className="text-xs mb-1.5 block">Description</Label>
                <Textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe the opportunity, what candidates will do, what they'll learn..." className="min-h-[100px] rounded-lg resize-none text-sm" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1.5 block">Academic level target</Label>
                  <Select value={form.level} onValueChange={(v) => set("level", v)}>
                    <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>{LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Deadline</Label>
                  <Input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className="h-10 rounded-lg" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1.5 block">Country</Label>
                  <Select value={form.country} onValueChange={(v) => set("country", v)}>
                    <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="Remote / Global">🌍 Remote / Global</SelectItem>
                      {ALL_COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <button type="button" onClick={() => set("is_remote", !form.is_remote)}
                    className={`w-11 h-6 rounded-full transition-colors ${form.is_remote ? "bg-primary" : "bg-border"} relative`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.is_remote ? "left-5" : "left-0.5"}`} />
                  </button>
                  <Label className="text-sm cursor-pointer" onClick={() => set("is_remote", !form.is_remote)}>Remote / hybrid</Label>
                </div>
              </div>
            </div>

            {/* Skills & Domains */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-sm text-foreground">Skills & Domains</h2>
              <div>
                <Label className="text-xs mb-1.5 block">Skills needed</Label>
                <TagInput tags={form.skills_needed} onChange={(v) => set("skills_needed", v)} placeholder="e.g. Python, teamwork..." />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Requirements</Label>
                <TagInput tags={form.requirements} onChange={(v) => set("requirements", v)} placeholder="e.g. 2+ years experience..." />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Domains</Label>
                <div className="flex flex-wrap gap-2">
                  {OPPORTUNITY_DOMAINS.map((d) => {
                    const active = form.domains.includes(d);
                    return (
                      <button key={d} type="button"
                        onClick={() => set("domains", active ? form.domains.filter((x) => x !== d) : [...form.domains, d])}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-border hover:border-primary/30"}`}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full h-12 rounded-xl text-base" size="lg">
              {submitting ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" /> : <Briefcase className="w-4 h-4 mr-2" />}
              {submitting ? "Posting..." : "Post Opportunity"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}