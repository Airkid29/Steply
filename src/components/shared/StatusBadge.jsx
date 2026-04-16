import { Bookmark, Clock, CheckCircle, Archive } from "lucide-react";

const statusConfig = {
  saved: { label: "Saved", icon: Bookmark, className: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  preparing: { label: "Preparing", icon: Clock, className: "bg-amber-50 text-amber-600 border-amber-200" },
  applied: { label: "Applied", icon: CheckCircle, className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  archived: { label: "Archived", icon: Archive, className: "bg-muted text-muted-foreground border-border" },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.saved;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}