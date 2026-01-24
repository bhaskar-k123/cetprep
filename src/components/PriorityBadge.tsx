import { Priority } from "@/types";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border",
        priority === "High" && "bg-primary text-white border-primary",
        priority === "Medium" && "bg-secondary text-primary border-primary/30",
        priority === "Low" && "bg-white text-muted-foreground border-border",
        className
      )}
    >
      {priority}
    </span>
  );
}
