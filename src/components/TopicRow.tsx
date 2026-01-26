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
  questionCount?: number;
  className?: string;
}

export function TopicRow({
  topic,
  isCompleted,
  onToggleComplete,
  showLink = true,
  questionCount,
  className,
}: TopicRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 py-3 px-4 border border-border/40 rounded-lg",
        "hover:bg-primary/5 transition-all duration-200 group",
        isCompleted && "bg-secondary/20",
        className
      )}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={onToggleComplete}
        aria-label={`Mark ${topic.name} as complete`}
        className="shrink-0 rounded-none border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <div className="flex-1 min-w-0">
        {showLink ? (
          <Link
            to={`/topic/${topic.id}`}
            className="font-sans text-sm font-semibold text-foreground hover:text-primary transition-colors block truncate"
          >
            {topic.name}
          </Link>
        ) : (
          <span className="font-sans text-sm font-semibold text-foreground truncate block">{topic.name}</span>
        )}
        {questionCount !== undefined && (
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-0.5">
            {questionCount} Questions
          </div>
        )}
      </div>
      <PriorityBadge priority={topic.priority} />
    </div>
  );
}
