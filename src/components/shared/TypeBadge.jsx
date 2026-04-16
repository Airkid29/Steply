import { GraduationCap, Trophy, Briefcase, Code2 } from "lucide-react";

const typeConfig = {
  scholarship: { label: "Scholarship", icon: GraduationCap, bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
  hackathon: { label: "Hackathon", icon: Code2, bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
  internship: { label: "Internship", icon: Briefcase, bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  junior_job: { label: "Junior Job", icon: Briefcase, bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  competition: { label: "Competition", icon: Trophy, bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
};

export default function TypeBadge({ type, size = "sm" }) {
  const config = typeConfig[type] || typeConfig.scholarship;
  const Icon = config.icon;
  const sizeClasses = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}>
      <Icon className={size === "lg" ? "w-4 h-4" : "w-3 h-3"} />
      {config.label}
    </span>
  );
}