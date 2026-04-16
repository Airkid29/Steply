import { GraduationCap, Code2, Briefcase, Trophy } from "lucide-react";

const goalOptions = [
  { value: "scholarship", label: "Scholarships", desc: "Funding for your studies", icon: GraduationCap },
  { value: "internship", label: "Internships", desc: "Gain real-world experience", icon: Briefcase },
  { value: "hackathon", label: "Hackathons", desc: "Build and compete", icon: Code2 },
  { value: "junior_job", label: "Junior Jobs", desc: "Start your career", icon: Briefcase },
  { value: "competition", label: "Competitions", desc: "Showcase your talent", icon: Trophy },
];

export default function StepGoals({ data, onChange }) {
  const goals = data.goals || [];

  const toggleGoal = (goal) => {
    if (goals.includes(goal)) {
      onChange({ ...data, goals: goals.filter((g) => g !== goal) });
    } else {
      onChange({ ...data, goals: [...goals, goal] });
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Select all that interest you:</p>
      {goalOptions.map((opt) => {
        const selected = goals.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggleGoal(opt.value)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              selected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>
              <opt.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-sm">{opt.label}</div>
              <div className="text-xs text-muted-foreground">{opt.desc}</div>
            </div>
            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              selected ? "border-primary bg-primary" : "border-border"
            }`}>
              {selected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}