import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const typeFilters = [
  { value: "all", label: "All" },
  { value: "scholarship", label: "Scholarships" },
  { value: "hackathon", label: "Hackathons" },
  { value: "internship", label: "Internships" },
  { value: "junior_job", label: "Jobs" },
  { value: "competition", label: "Competitions" },
];

export default function FilterBar({ search, onSearchChange, activeType, onTypeChange }) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search opportunities..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-card border-border"
        />
        {search && (
          <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-secondary">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {typeFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onTypeChange(filter.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeType === filter.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}