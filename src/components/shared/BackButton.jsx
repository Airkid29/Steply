import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackButton({
  label = "Back",
  to,
  fallbackTo = "/dashboard",
  variant = "ghost",
  size = "sm",
  className = "",
}) {
  const navigate = useNavigate();

  const onClick = useCallback(() => {
    if (to) {
      navigate(to);
      return;
    }

    // If the user landed directly on this page (no meaningful history),
    // going back can be a no-op. Use a safe fallback.
    if (window.history.length <= 1) {
      navigate(fallbackTo, { replace: true });
      return;
    }

    navigate(-1);
  }, [to, navigate, fallbackTo]);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      className={`flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
}

