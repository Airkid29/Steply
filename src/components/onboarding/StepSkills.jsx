import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const suggestedTechnical = ["Python", "JavaScript", "React", "SQL", "Java", "C++", "Excel", "Figma", "R", "Machine Learning", "Node.js", "TypeScript", "Django", "Flask", "TensorFlow", "PyTorch", "Docker", "Kubernetes", "AWS", "Git", "HTML", "CSS", "Vue.js", "Angular", "MongoDB", "PostgreSQL", "MySQL", "Linux", "Bash", "C#", "Go", "Rust", "Swift", "Kotlin"];
const suggestedSoft = ["Communication", "Teamwork", "Leadership", "Problem Solving", "Critical Thinking", "Creativity", "Adaptability", "Time Management", "Emotional Intelligence", "Conflict Resolution", "Mentoring", "Public Speaking", "Negotiation", "Project Management", "Decision Making", "Empathy", "Collaboration", "Flexibility", "Resilience", "Self-Motivation"];
const suggestedLanguages = ["English", "French", "Spanish", "Arabic", "German", "Mandarin", "Portuguese", "Japanese", "Italian", "Russian", "Hindi", "Korean", "Dutch", "Swedish", "Turkish", "Polish", "Greek", "Hebrew", "Thai", "Vietnamese"];

function TagInput({ label, tags, onChange, suggestions }) {
  const [input, setInput] = useState("");

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  const availableSuggestions = suggestions.filter((s) => !tags.includes(s));

  return (
    <div>
      <Label className="text-sm font-medium mb-1.5 block">{label}</Label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:bg-primary/20 rounded-full p-0.5">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 mb-2">
        <Input
          placeholder="Type and press Enter..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(input); } }}
          className="h-10 rounded-xl flex-1"
        />
        <Button variant="outline" size="sm" onClick={() => addTag(input)} className="rounded-xl h-10 px-3">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableSuggestions.slice(0, 6).map((s) => (
            <button
              key={s}
              onClick={() => addTag(s)}
              className="px-2.5 py-1 rounded-full text-xs font-medium border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StepSkills({ data, onChange }) {
  return (
    <div className="space-y-6">
      <TagInput
        label="Technical skills"
        tags={data.technical_skills || []}
        onChange={(v) => onChange({ ...data, technical_skills: v })}
        suggestions={suggestedTechnical}
      />
      <TagInput
        label="Soft skills"
        tags={data.soft_skills || []}
        onChange={(v) => onChange({ ...data, soft_skills: v })}
        suggestions={suggestedSoft}
      />
      <TagInput
        label="Languages"
        tags={data.languages || []}
        onChange={(v) => onChange({ ...data, languages: v })}
        suggestions={suggestedLanguages}
      />
    </div>
  );
}