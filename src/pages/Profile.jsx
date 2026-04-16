import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, RefreshCw, X, Plus, User, Camera, Bell, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ALL_COUNTRIES } from "@/lib/countries";

const levels = [
  { value: "high_school", label: "High School" }, { value: "bachelor_1", label: "Bachelor Year 1" },
  { value: "bachelor_2", label: "Bachelor Year 2" }, { value: "bachelor_3", label: "Bachelor Year 3" },
  { value: "master_1", label: "Master Year 1" }, { value: "master_2", label: "Master Year 2" }, { value: "phd", label: "PhD" },
];
const goalOptions = ["scholarship", "internship", "hackathon", "junior_job", "competition"];
const goalLabels = { scholarship: "Scholarships", internship: "Internships", hackathon: "Hackathons", junior_job: "Junior Jobs", competition: "Competitions" };

function TagEditor({ tags, onChange, placeholder = "Ajouter..." }) {
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
            <button onClick={() => onChange(tags.filter((t) => t !== tag))}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder} className="h-9 rounded-lg flex-1" />
        <Button variant="outline" size="sm" onClick={add} className="h-9 rounded-lg"><Plus className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
}

export default function Profile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [data, setData] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)); }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (profile) setData(profile);
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const saveData = { ...data };
      delete saveData.id; delete saveData.created_date; delete saveData.updated_date; delete saveData.created_by;
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, saveData);
      } else {
        await base44.entities.UserProfile.create(saveData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({ title: "Profile saved!" });
    },
  });

  const updateField = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const res = await base44.integrations.Core.UploadFile({ file });
    updateField("avatar_url", res.file_url);
    setUploadingPhoto(false);
    toast({ title: "Photo uploaded", description: "Don't forget to save your profile." });
  };

  const sendTestNotification = async () => {
    if (!user?.email) return;
    setSendingEmail(true);
    const name = data.name || user.full_name || "there";
    const field = data.field_of_study || "your field";
    const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 40px;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:10px;display:inline-block;line-height:36px;text-align:center;font-size:18px;">✨</div>
            <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Steply</span>
          </div>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Alerts activated! 🎉</h1>
          <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Hi ${name},</p>
          <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
            Your email alerts on <strong style="color:#4f46e5;">Steply</strong> are now active. You'll receive personalized notifications whenever new opportunities matching your profile in <strong>${field}</strong> become available.
          </p>
          <div style="background:#f5f3ff;border-left:4px solid #4f46e5;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:28px;">
            <p style="margin:0;color:#4f46e5;font-size:14px;font-weight:600;">What you'll receive:</p>
            <ul style="margin:8px 0 0;padding-left:20px;color:#6d28d9;font-size:14px;line-height:1.8;">
              <li>High-match opportunities (&gt;75% compatibility)</li>
              <li>Deadline reminders for saved opportunities</li>
              <li>New scholarships, internships &amp; hackathons in your field</li>
            </ul>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 32px;">
            <a href="https://steply.com/dashboard" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:100px;box-shadow:0 4px 12px rgba(79,70,229,0.3);">View my matches →</a>
          </td></tr></table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:13px;">Steply · AI career matching for students &amp; graduates</p>
          <p style="margin:4px 0 0;color:#d1d5db;font-size:12px;">You're receiving this because you enabled alerts in your profile.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: "✅ Your Steply alerts are now active",
      body: htmlBody,
    });
    setSendingEmail(false);
    toast({ title: "Confirmation email sent!", description: `Check your inbox at ${user.email}` });
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Complete your profile for better matches</p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="rounded-xl">
          {saveMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save profile
        </Button>
      </div>

      {/* Photo de profil */}
      <section className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-sm flex items-center gap-2 mb-4"><Camera className="w-4 h-4 text-primary" /> Profile photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-secondary overflow-hidden flex items-center justify-center border border-border">
              {data.avatar_url ? (
                <img src={data.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <label htmlFor="photo-upload" className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-primary flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors">
              {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 text-primary-foreground animate-spin" /> : <Camera className="w-3.5 h-3.5 text-primary-foreground" />}
            </label>
            <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div>
            <p className="text-sm font-medium">{user?.full_name || "—"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP · Max 5MB</p>
          </div>
        </div>
      </section>

      {/* Personal */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold text-sm flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Personal information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs mb-1 block">Full name</Label>
            <Input value={data.name || ""} onChange={(e) => updateField("name", e.target.value)} className="h-10 rounded-lg" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Country</Label>
            <Select value={data.country || ""} onValueChange={(v) => updateField("country", v)}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {ALL_COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Academic */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold text-sm">Academic information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs mb-1 block">Field of study</Label>
...
            <Label className="text-xs mb-1 block">Academic level</Label>
            <Select value={data.academic_level || ""} onValueChange={(v) => updateField("academic_level", v)}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent className="max-h-60">{levels.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold text-sm">Skills & Languages</h2>
        <div>
          <Label className="text-xs mb-1.5 block">Technical skills</Label>
          <TagEditor tags={data.technical_skills || []} onChange={(v) => updateField("technical_skills", v)} placeholder="e.g. Python, Excel, SQL..." />
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">Soft skills</Label>
          <TagEditor tags={data.soft_skills || []} onChange={(v) => updateField("soft_skills", v)} placeholder="e.g. Leadership, Communication..." />
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">Languages</Label>
          <TagEditor tags={data.languages || []} onChange={(v) => updateField("languages", v)} placeholder="e.g. French, English..." />
        </div>
      </section>

      {/* Goals */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold text-sm">Career goals</h2>
        <div className="flex flex-wrap gap-2">
          {goalOptions.map((g) => {
            const active = (data.goals || []).includes(g);
            return (
              <button key={g}
                onClick={() => updateField("goals", active ? (data.goals || []).filter((x) => x !== g) : [...(data.goals || []), g])}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${active ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-border hover:border-primary/30"}`}>
                {goalLabels[g]}
              </button>
            );
          })}
        </div>
      </section>

      {/* Email notifications */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Email alerts
        </h2>
        <p className="text-sm text-muted-foreground">
          Get notified by email when new opportunities match your profile in {data.field_of_study || "your field of study"}.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => updateField("email_notifications", !data.email_notifications)}
            className={`w-11 h-6 rounded-full transition-colors ${data.email_notifications ? "bg-primary" : "bg-border"} relative`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${data.email_notifications ? "left-5" : "left-0.5"}`} />
          </button>
          <span className="text-sm font-medium">{data.email_notifications ? "Alerts enabled" : "Alerts disabled"}</span>
        </div>
        {data.email_notifications && (
          <Button variant="outline" size="sm" onClick={sendTestNotification} disabled={sendingEmail} className="rounded-lg gap-2">
            {sendingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
            Send test email
          </Button>
        )}
      </section>
    </div>
  );
}