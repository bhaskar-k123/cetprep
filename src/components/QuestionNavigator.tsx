import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  // answerStatus: Map questionID to status
  answerStatus: Record<string, "correct" | "incorrect" | "answered">;
  markedQuestions: Set<string>;
  questionIds: string[];
  onNavigate: (index: number) => void;
  className?: string;
}

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answerStatus,
  markedQuestions,
  questionIds,
  onNavigate,
  className,
}: QuestionNavigatorProps) {
  const answeredCount = Object.keys(answerStatus).length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <h4 className="font-heading font-bold text-lg text-foreground uppercase tracking-widest">Assessment Map</h4>
        <span className="text-[10px] font-bold text-primary bg-primary/5 border border-primary/20 px-3 py-1">
          {answeredCount} / {totalQuestions}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const questionId = questionIds[i];
          const status = answerStatus[questionId];
          const isMarked = markedQuestions.has(questionId);
          const isCurrent = i === currentIndex;

          let baseClasses = "bg-card border-border hover:border-primary/50 hover:bg-secondary/50";

          if (status === "correct") {
            baseClasses = "bg-emerald-500 text-white border-emerald-600 shadow-sm";
          } else if (status === "incorrect") {
            baseClasses = "bg-destructive text-white border-destructive shadow-sm";
          } else if (status === "answered") {
            // Neutral/Answered but not validated (Manual mode pending)
            // Maybe a slight blue or just darker gray?
            baseClasses = "bg-secondary text-foreground border-primary/30";
          }

          if (isCurrent) {
            baseClasses = "bg-primary text-white border-primary rotate-45 scale-110 z-10 shadow-lg shadow-primary/20";
          }

          return (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={cn(
                "relative h-10 w-10 text-xs font-bold transition-all duration-300 flex items-center justify-center border rounded-sm",
                baseClasses
              )}
            >
              <span className={isCurrent ? "-rotate-45" : ""}>{i + 1}</span>
              {isMarked && (
                <div className={cn("absolute -top-1 -right-1", isCurrent ? "-rotate-45" : "")}>
                  <Star className={cn("h-3 w-3",
                    (status === "correct" || status === "incorrect" || isCurrent) ? "text-white fill-white" : "text-primary fill-primary"
                  )} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="text-[10px] font-bold text-muted-foreground space-y-3 pt-8 border-t border-border mt-8 uppercase tracking-widest">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 border border-emerald-600 rounded-sm" />
          <span>Correct</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-destructive border border-destructive rounded-sm" />
          <span>Incorrect</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-card border border-border rounded-sm" />
          <span>Pending / Unattempted</span>
        </div>
        <div className="flex items-center gap-3">
          <Star className="h-3 w-3 text-primary" />
          <span>Marked for Review</span>
        </div>
      </div>
    </div>
  );
}
