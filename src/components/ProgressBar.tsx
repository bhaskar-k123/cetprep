import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  className,
  showLabel = true,
  size = "md",
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full bg-secondary overflow-hidden border border-border/20 shadow-inner",
          size === "sm" && "h-1",
          size === "md" && "h-2",
          size === "lg" && "h-4"
        )}
      >
        <div
          className="h-full bg-primary transition-all duration-500 ease-in-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-2 text-[10px] font-bold text-muted-foreground text-right uppercase tracking-[2px]">
          {Math.round(clampedValue)}% PROCESSED
        </div>
      )}
    </div>
  );
}
