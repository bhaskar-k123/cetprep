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
    <div className={cn("space-y-8", className)}>
      {/* Instruction Text (for Sets) */}
      {question.instruction_text && (
        <div className="bg-secondary/20 p-6 border-l-4 border-primary/40 text-muted-foreground whitespace-pre-wrap leading-relaxed font-serif text-lg mb-8">
          {question.instruction_text}
        </div>
      )}

      <div className="space-y-6 border-b border-border pb-8">
        {/* Question Content */}
        {question.question_text && (
          <div className="text-foreground whitespace-pre-wrap leading-relaxed font-sans text-2xl font-semibold">
            {question.question_text}
          </div>
        )}

        {/* Question Image */}
        {question.question_image && (
          <div className="rounded-lg overflow-hidden border border-border shadow-sm">
            <img
              src={`/${question.question_image}`}
              alt="Question"
              className="max-w-full h-auto"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        {options.map((option) => {
          const isSelected = selectedOption === option.key;
          const isCorrectOption = option.key === question.correct_option;

          let optionClasses =
            "flex items-start gap-6 p-6 border transition-all duration-300 group relative overflow-hidden cursor-pointer";

          if (isSubmitted) {
            if (isCorrectOption) {
              optionClasses += " border-primary/50 bg-primary/5 text-foreground";
            } else if (isSelected && !isCorrectOption) {
              optionClasses += " border-destructive/40 bg-destructive/5 text-muted-foreground";
            } else {
              optionClasses += " border-border/40 bg-secondary/20 opacity-40";
            }
          } else {
            if (isSelected) {
              optionClasses += " border-primary bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/5";
            } else {
              optionClasses += " border-border bg-card hover:bg-secondary/50 hover:border-primary/30";
            }
          }

          return (
            <div
              key={option.key}
              className={optionClasses}
              onClick={() => !isSubmitted && onSelectOption(option.key)}
            >
              {/* Selection Hex/Square */}
              <div className={cn(
                "h-7 w-7 border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 rotate-45 rounded-sm",
                isSelected || (isSubmitted && isCorrectOption)
                  ? "bg-primary border-primary text-white"
                  : "border-border bg-secondary text-muted-foreground group-hover:border-primary/50"
              )}>
                <span className="text-[10px] font-bold -rotate-45">{option.key}</span>
              </div>

              <div className="flex-1">
                {option.text && (
                  <span className="text-lg font-sans font-medium leading-relaxed block mb-2">{option.text}</span>
                )}
                {option.image && (
                  <div className="mt-1 rounded border border-border/50 bg-card p-1 inline-block">
                    <img
                      src={`/${option.image}`}
                      alt={`Option ${option.key}`}
                      className="max-h-[150px] w-auto"
                    />
                  </div>
                )}
              </div>

              {isSubmitted && isCorrectOption && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <Check className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isSubmitted && showExplanation && question.explanation && (
        <div className="mt-12 p-10 bg-secondary border border-border text-lg font-sans italic leading-relaxed text-muted-foreground relative">
          <div className="absolute top-0 left-10 -translate-y-1/2 bg-background px-4 text-xs font-bold text-primary uppercase tracking-widest border border-border">
            Scholarly Explanation
          </div>
          <div className="prose prose-slate max-w-none">
            {question.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
