import { Question } from "@/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  selectedOption: "A" | "B" | "C" | "D" | "E" | null;
  isSubmitted: boolean;
  onSelectOption: (option: "A" | "B" | "C" | "D" | "E") => void;
  showExplanation?: boolean;
  className?: string;
}

export function QuestionCard({
  question,
  selectedOption,
  isSubmitted,
  onSelectOption,
  showExplanation = false,
  className,
}: QuestionCardProps) {
  // Define all potential options
  const potentialOptions: { key: "A" | "B" | "C" | "D" | "E"; text: string | null; image?: string | null }[] = [
    { key: "A", text: question.option_a, image: question.option_a_image },
    { key: "B", text: question.option_b, image: question.option_b_image },
    { key: "C", text: question.option_c, image: question.option_c_image },
    { key: "D", text: question.option_d, image: question.option_d_image },
    { key: "E", text: question.option_e ?? null, image: question.option_e_image },
  ];

  // Filter to valid options (must have text or image)
  const options = potentialOptions.filter(opt => opt.text !== null || (opt.image !== null && opt.image !== undefined));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Instruction Text (for Sets) */}
      {question.instruction_text && (
        <div className="bg-secondary/20 p-3 border-l-4 border-primary/40 text-muted-foreground whitespace-pre-wrap leading-relaxed font-serif text-sm mb-4">
          {question.instruction_text}
        </div>
      )}

      <div className="space-y-2 border-b border-border pb-2">
        {/* Question Content */}
        {question.question_text && (
          <div className="text-foreground whitespace-pre-wrap leading-relaxed font-sans text-lg font-semibold">
            {question.question_text}
          </div>
        )}

        {/* Question Image */}
        {question.question_image && (
          <div className="rounded-lg overflow-hidden border border-border shadow-sm max-h-[200px] flex justify-center bg-secondary/10">
            <img
              src={`/${question.question_image}`}
              alt="Question"
              className="max-h-full w-auto object-contain"
            />
          </div>
        )}
      </div>

      <div className="space-y-2" role="radiogroup" aria-label="Answer options">
        {options.map((option) => {
          const isSelected = selectedOption === option.key;
          const isCorrectOption = option.key === question.correct_option;

          let optionClasses =
            "w-full text-left flex items-start gap-3 p-3 border transition-all duration-300 group relative overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg";

          if (isSubmitted) {
            if (isCorrectOption) {
              optionClasses += " border-primary/50 bg-primary/10 text-foreground";
            } else if (isSelected && !isCorrectOption) {
              optionClasses += " border-destructive/40 bg-destructive/10 text-foreground/80";
            } else {
              optionClasses += " border-border/40 bg-secondary/20 opacity-60";
            }
          } else {
            if (isSelected) {
              optionClasses += " border-primary bg-primary/10 ring-1 ring-primary/20 shadow-lg shadow-primary/5";
            } else {
              optionClasses += " border-border bg-card hover:bg-secondary/50 hover:border-primary/30";
            }
          }

          return (
            <button
              type="button"
              key={option.key}
              className={optionClasses}
              onClick={() => onSelectOption(option.key)}
              aria-checked={isSelected}
              role="radio"
              aria-label={`Option ${option.key}: ${option.text || "Image option"}`}
              disabled={isSubmitted}
            >
              {/* Selection Hex/Square */}
              <div className={cn(
                "h-6 w-6 border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 rotate-45 rounded-sm",
                isSelected || (isSubmitted && isCorrectOption)
                  ? "bg-primary border-primary text-white"
                  : "border-border bg-secondary text-muted-foreground group-hover:border-primary/50"
              )}>
                <span className="text-[9px] font-bold -rotate-45">{option.key}</span>
              </div>

              <div className="flex-1">
                {option.text && (
                  <span className="text-base font-sans font-medium leading-tight block">{option.text}</span>
                )}
                {option.image && (
                  <div className="mt-1 rounded border border-border/50 bg-card p-1 inline-block">
                    <img
                      src={`/${option.image}`}
                      alt={`Option ${option.key}`}
                      className="max-h-[100px] w-auto"
                    />
                  </div>
                )}
              </div>

              {isSubmitted && isCorrectOption && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {isSubmitted && showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-secondary border border-border text-sm font-sans italic leading-relaxed text-muted-foreground relative">
          <div className="absolute top-0 left-6 -translate-y-1/2 bg-background px-2 text-[9px] font-bold text-primary uppercase tracking-widest border border-border">
            Scholarly Explanation
          </div>
          <div className="prose prose-sm prose-slate max-w-none">
            {question.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
