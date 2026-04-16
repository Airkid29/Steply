import { differenceInDays, format, parseISO } from "date-fns";
import { Clock } from "lucide-react";

export default function DeadlineBadge({ deadline }) {
  if (!deadline) return null;

  const date = typeof deadline === "string" ? parseISO(deadline) : deadline;
  const daysLeft = differenceInDays(date, new Date());

  let colorClass = "text-muted-foreground";
  let label = format(date, "MMM d, yyyy");

  if (daysLeft < 0) {
    colorClass = "text-muted-foreground line-through";
    label = "Expired";
  } else if (daysLeft <= 3) {
    colorClass = "text-rose-600";
    label = daysLeft === 0 ? "Today!" : `${daysLeft}d left`;
  } else if (daysLeft <= 14) {
    colorClass = "text-amber-600";
    label = `${daysLeft}d left`;
  } else {
    label = format(date, "MMM d");
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${colorClass}`}>
      <Clock className="w-3 h-3" />
      {label}
    </span>
  );
}