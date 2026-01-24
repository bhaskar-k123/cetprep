import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakIndicatorProps {
  streak: number;
  className?: string;
}

export function StreakIndicator({ streak, className }: StreakIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        streak > 0 ? "bg-priority-high-bg" : "bg-secondary",
        className
      )}
    >
      <Flame
        className={cn(
          "h-4 w-4",
          streak > 0 ? "text-priority-high" : "text-muted-foreground"
        )}
      />
      <span
        className={cn(
          "text-sm font-medium",
          streak > 0 ? "text-priority-high" : "text-muted-foreground"
        )}
      >
        {streak} {streak === 1 ? "day" : "days"}
      </span>
    </div>
  );
}
