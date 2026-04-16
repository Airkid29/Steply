import { Link } from "react-router-dom";
import { ArrowRight, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ProfileCompletion({ profile }) {
  if (!profile) return null;

  const fields = [
    profile.name,
    profile.country,
    profile.field_of_study,
    profile.academic_level,
    profile.technical_skills?.length > 0,
    profile.soft_skills?.length > 0,
    profile.languages?.length > 0,
    profile.goals?.length > 0,
  ];
  const completed = fields.filter(Boolean).length;
  const total = fields.length;
  const percentage = Math.round((completed / total) * 100);

  if (percentage === 100) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <User className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium">Complete your profile</span>
          <span className="text-xs text-muted-foreground">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-1.5" />
      </div>
      <Link to="/profile" className="text-primary hover:text-primary/80 transition-colors shrink-0">
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}