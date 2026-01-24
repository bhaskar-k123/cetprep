import { Topic } from "@/types";
import { PriorityBadge } from "./PriorityBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface TopicRowProps {
  topic: Topic;
  isCompleted: boolean;
  onToggleComplete: () => void;
  showLink?: boolean;
  className?: string;
}

export function TopicRow({
  topic,
  isCompleted,
  onToggleComplete,
  showLink = true,
  className,
}: TopicRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-6 py-4 px-6 border-b border-border/40 last:border-b-0",
        "hover:bg-primary/5 transition-all duration-200 group",
        isCompleted && "bg-secondary/20",
        className
      )}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={onToggleComplete}
        className="shrink-0 rounded-none border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <div className="flex-1 min-w-0">
        {showLink ? (
          <Link
            to={`/topic/${topic.id}`}
            className="font-sans text-base font-semibold text-foreground hover:text-primary transition-colors block"
          >
            {topic.name}
          </Link>
        ) : (
          <span className="font-sans text-base font-semibold text-foreground">{topic.name}</span>
        )}
      </div>
      <PriorityBadge priority={topic.priority} />
    </div>
  );
}
