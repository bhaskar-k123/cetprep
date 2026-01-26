import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakIndicatorProps {
  streak: number;
  className?: string;
}

export function StreakIndicator({ streak, className }: StreakIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Flame
        className={cn(
          "h-3 w-3",
          streak > 0 ? "fill-orange-500 text-orange-600" : "text-muted-foreground"
        )}
      />
      <span
        className={cn(
          "text-xs font-bold",
          streak > 0 ? "text-orange-700" : "text-muted-foreground"
        )}
      >
        {streak} {streak === 1 ? "day" : "days"}
      </span>
    </div>
  );
}
