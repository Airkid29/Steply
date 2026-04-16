import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, MapPin } from "lucide-react";
import TypeBadge from "../shared/TypeBadge";
import MatchScore from "../shared/MatchScore";
import DeadlineBadge from "../shared/DeadlineBadge";

export default function OpportunityCard({ opportunity, score, explanation, isSaved, onToggleSave }) {
  return (
    <div className="group bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 p-5">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <TypeBadge type={opportunity.type} />
            <DeadlineBadge deadline={opportunity.deadline} />
          </div>
          <Link to={`/opportunity/${opportunity.id}`} className="block">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
              {opportunity.title}
            </h3>
          </Link>
          {explanation && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{explanation}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {opportunity.organizer && <span className="truncate">{opportunity.organizer}</span>}
            {opportunity.country && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {opportunity.is_remote ? "Remote" : opportunity.country}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 shrink-0">
          <MatchScore score={score || 0} />
          <button
            onClick={(e) => { e.preventDefault(); onToggleSave?.(opportunity); }}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            aria-label={isSaved ? "Unsave" : "Save"}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-primary" />
            ) : (
              <Bookmark className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}