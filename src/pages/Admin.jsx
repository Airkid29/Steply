import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Plus, Pencil, Trash2, X, Save, Loader2, TrendingUp, Users, Briefcase, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const TYPES = ["scholarship", "hackathon", "internship", "junior_job", "competition"];
const LEVELS = ["high_school", "bachelor", "master", "phd", "any"];

const emptyOpp = {
  title: "", type: "internship", description: "", organizer: "", country: "",
  url: "", deadline: "", level: "any", is_remote: false,
  domains: [], requirements: [], skills_needed: [],
};

function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (t && !value.includes(t)) { onChange([...value, t]); setInput(""); }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
            {tag}
            <button type="button" onClick={() => onChange(value.filter(t => t !== tag))}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder} className="h-8 text-sm" />
        <Button type="button" variant="outline" size="sm" onClick={add} className="h-8 px-3">Add</Button>
      </div>
    </div>
  );
}

function OppForm({ opp, onSave, onCancel, saving }) {
  const [data, setData] = useState(opp || emptyOpp);
  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(data); }} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs mb-1 block">Title *</Label>
          <Input required value={data.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Software Engineer Internship" className="h-9" />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Type *</Label>
          <Select value={data.type} onValueChange={v => set("type", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.map(t => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Organizer</Label>
          <Input value={data.organizer} onChange={e => set("organizer", e.target.value)} placeholder="Company or institution" className="h-9" />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Country</Label>
          <Input value={data.country} onChange={e => set("country", e.target.value)} placeholder="e.g. France, Remote, USA" className="h-9" />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Deadline</Label>
          <Input type="date" value={data.deadline || ""} onChange={e => set("deadline", e.target.value)} className="h-9" />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Level</Label>
          <Select value={data.level || "any"} onValueChange={v => set("level", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {LEVELS.map(l => <SelectItem key={l} value={l}>{l.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs mb-1 block">Official URL</Label>
          <Input type="url" value={data.url} onChange={e => set("url", e.target.value)} placeholder="https://..." className="h-9" />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs mb-1 block">Description</Label>
          <textarea value={data.description} onChange={e => set("description", e.target.value)}
            placeholder="Describe the opportunity..."
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label className="text-xs mb-1 block">Domains</Label>
          <TagInput value={data.domains} onChange={v => set("domains", v)} placeholder="e.g. Computer Science" />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Requirements</Label>
          <TagInput value={data.requirements} onChange={v => set("requirements", v)} placeholder="e.g. GPA 3.5+" />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Skills needed</Label>
          <TagInput value={data.skills_needed} onChange={v => set("skills_needed", v)} placeholder="e.g. Python, Excel" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="remote" checked={!!data.is_remote} onChange={e => set("is_remote", e.target.checked)} className="rounded" />
        <label htmlFor="remote" className="text-sm">Remote opportunity</label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg">Cancel</Button>
        <Button type="submit" disabled={saving} className="rounded-lg gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </Button>
      </div>
    </form>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [editing, setEditing] = useState(null); // null | "new" | opp object
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setAuthChecked(true);
      if (u?.role !== "admin") navigate("/dashboard", { replace: true });
    }).catch(() => { setAuthChecked(true); navigate("/", { replace: true }); });
  }, []);

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: () => base44.entities.Opportunity.list("-created_date", 200),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["allApplications"],
    queryFn: () => base44.entities.Application.list("-created_date", 500),
  });

  const { data: registeredUsers = [] } = useQuery({
    queryKey: ["registeredUsers"],
    queryFn: () => base44.auth.listUsers(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["allProfiles"],
    queryFn: () => base44.entities.UserProfile.list("-created_date", 200),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Opportunity.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["opportunities"] }); setEditing(null); toast({ title: "Opportunity created!" }); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Opportunity.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["opportunities"] }); setEditing(null); toast({ title: "Opportunity updated!" }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Opportunity.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["opportunities"] }); toast({ title: "Opportunity deleted." }); },
  });

  const handleSave = (data) => {
    const cleanData = { ...data };
    delete cleanData.id; delete cleanData.created_date; delete cleanData.updated_date; delete cleanData.created_by;
    if (editing === "new") {
      createMut.mutate(cleanData);
    } else {
      updateMut.mutate({ id: editing.id, data: cleanData });
    }
  };

  const filtered = opportunities.filter(o => {
    if (filterType !== "all" && o.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.title?.toLowerCase().includes(q) || o.organizer?.toLowerCase().includes(q) || o.country?.toLowerCase().includes(q);
    }
    return true;
  });

  const stats = [
    { label: "Total opportunities", value: opportunities.length, icon: Briefcase, color: "text-primary" },
    { label: "Registered accounts", value: registeredUsers.length, icon: Users, color: "text-emerald-500" },
    { label: "Completed profiles", value: profiles.length, icon: TrendingUp, color: "text-amber-500" },
    { label: "Applied", value: applications.filter(a => a.status === "applied").length, icon: CheckCircle, color: "text-violet-500" },
  ];

  if (!authChecked) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">Back Office</h1>
          <p className="text-sm text-muted-foreground">Manage opportunities and platform data</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <s.icon className={`w-5 h-5 shrink-0 ${s.color}`} />
            <div>
              <div className="text-lg font-bold font-display">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Opportunities management */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">Opportunities</h2>
          <Button onClick={() => setEditing("new")} size="sm" className="rounded-lg gap-1.5">
            <Plus className="w-4 h-4" />
            New opportunity
          </Button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-wrap gap-3">
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 max-w-xs"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9 w-40"><SelectValue placeholder="All types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {TYPES.map(t => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="p-4 border-b border-border bg-secondary/30">
            <h3 className="font-semibold mb-4">{editing === "new" ? "New opportunity" : `Edit: ${editing.title}`}</h3>
            <OppForm
              opp={editing === "new" ? null : editing}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
              saving={createMut.isPending || updateMut.isPending}
            />
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No opportunities found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Organizer</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Deadline</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((opp) => (
                  <tr key={opp.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">{opp.title}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary capitalize">{opp.type?.replace("_", " ")}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{opp.organizer || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{opp.deadline || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(opp)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (confirm(`Delete "${opp.title}"?`)) deleteMut.mutate(opp.id); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-4 py-3 text-xs text-muted-foreground border-t border-border">
          {filtered.length} of {opportunities.length} opportunities
        </div>
      </div>
    </div>
  );
}