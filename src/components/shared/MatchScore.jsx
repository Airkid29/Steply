import { cn } from "@/lib/utils";

export default function MatchScore({ score, size = "md" }) {
  const getColor = (s) => {
    if (s >= 80) return { ring: "text-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" };
    if (s >= 60) return { ring: "text-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700" };
    if (s >= 40) return { ring: "text-amber-500", bg: "bg-amber-50", text: "text-amber-700" };
    return { ring: "text-muted-foreground", bg: "bg-muted", text: "text-muted-foreground" };
  };

  const colors = getColor(score);
  const dimensions = size === "lg" ? "w-16 h-16" : size === "md" ? "w-12 h-12" : "w-9 h-9";
  const fontSize = size === "lg" ? "text-lg" : size === "md" ? "text-sm" : "text-xs";
  const radius = size === "lg" ? 28 : size === "md" ? 20 : 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const svgSize = size === "lg" ? 64 : size === "md" ? 48 : 36;
  const strokeWidth = size === "lg" ? 3 : 2.5;

  return (
    <div className={cn("relative inline-flex items-center justify-center", dimensions)}>
      <svg className="absolute inset-0 -rotate-90" width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        <circle cx={svgSize / 2} cy={svgSize / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-border" />
        <circle
          cx={svgSize / 2} cy={svgSize / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
          className={colors.ring}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      <span className={cn("font-semibold relative z-10", fontSize, colors.text)}>{score}</span>
    </div>
  );
}