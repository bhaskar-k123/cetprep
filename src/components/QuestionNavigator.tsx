import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  answeredQuestions: Set<string>;
  markedQuestions: Set<string>;
  questionIds: string[];
  onNavigate: (index: number) => void;
  className?: string;
}

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answeredQuestions,
  markedQuestions,
  questionIds,
  onNavigate,
  className,
}: QuestionNavigatorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <h4 className="font-heading font-bold text-lg text-foreground uppercase tracking-widest">Assessment Map</h4>
        <span className="text-[10px] font-bold text-primary bg-primary/5 border border-primary/20 px-3 py-1">
          {answeredQuestions.size} / {totalQuestions}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const questionId = questionIds[i];
          const isAnswered = answeredQuestions.has(questionId);
          const isMarked = markedQuestions.has(questionId);
          const isCurrent = i === currentIndex;

          return (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={cn(
                "relative h-10 w-10 text-xs font-bold transition-all duration-300 flex items-center justify-center border rounded-sm",
                isCurrent
                  ? "bg-primary text-white border-primary rotate-45 scale-110 z-10 shadow-lg shadow-primary/20"
                  : "bg-card border-border hover:border-primary/50 hover:bg-secondary/50",
                isAnswered && !isCurrent && "bg-emerald-500 text-white border-emerald-600 shadow-sm", // Distinct Green for Answered
              )}
            >
              <span className={isCurrent ? "-rotate-45" : ""}>{i + 1}</span>
              {isMarked && (
                <div className={cn("absolute -top-1 -right-1", isCurrent ? "-rotate-45" : "")}>
                  <Star className="h-3 w-3 text-primary fill-primary" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="text-[10px] font-bold text-muted-foreground space-y-3 pt-8 border-t border-border mt-8 uppercase tracking-widest">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-secondary border border-border" />
          <span>Processed</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-card border border-border" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-3">
          <Star className="h-3 w-3 text-primary" />
          <span>Marked for Review</span>
        </div>
      </div>
    </div>
  );
}
