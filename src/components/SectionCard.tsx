import { Link } from "react-router-dom";
import { Section } from "@/types";
import { ProgressBar } from "./ProgressBar";
import { cn } from "@/lib/utils";
import { BookOpen, Brain, Calculator, FileText } from "lucide-react";

interface SectionCardProps {
  section: Section;
  completedTopics: number;
  totalTopics: number;
  className?: string;
}

const sectionIcons: Record<string, React.ElementType> = {
  LR: Brain,
  AR: BookOpen,
  QA: Calculator,
  VARC: FileText,
};

export function SectionCard({
  section,
  completedTopics,
  totalTopics,
  className,
}: SectionCardProps) {
  const percentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
  const Icon = sectionIcons[section.id] || BookOpen;

  return (
    <Link
      to={`/syllabus?section=${section.id}`}
      className={cn(
        "academic-card block group hover:bg-primary/5 p-4",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-secondary border border-border text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 rounded-lg">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold text-sm text-foreground leading-tight mb-2 tracking-tight">{section.name}</h3>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {completedTopics} / {totalTopics} TOPICS
            </p>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {Math.round(percentage)}%
            </span>
          </div>
          <ProgressBar
            value={percentage}
            showLabel={false}
            size="sm"
            className="h-1 bg-secondary"
          />
        </div>
      </div>
    </Link>
  );
}
