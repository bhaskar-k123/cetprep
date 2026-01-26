import { differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

export function ExamCountdown() {
  const today = new Date();

  // MBA CET Dates 2026
  const attempt1Date = new Date("2026-04-06");
  const attempt2Date = new Date("2026-05-09");

  const daysToAttempt1 = differenceInDays(attempt1Date, today);
  const daysToAttempt2 = differenceInDays(attempt2Date, today);

  return (
    <div className="grid grid-cols-2 gap-2 h-full">
      <CountdownCard
        attempt="Attempt 1"
        date="April 06"
        days={daysToAttempt1}
        colorClass="bg-blue-500/10 border-blue-500/20 text-blue-700"
      />
      <CountdownCard
        attempt="Attempt 2"
        date="May 09"
        days={daysToAttempt2}
        colorClass="bg-purple-500/10 border-purple-500/20 text-purple-700"
      />
    </div>
  );
}

function CountdownCard({ attempt, date, days, colorClass }: { attempt: string, date: string, days: number, colorClass: string }) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-1.5 rounded-lg border h-full w-full", colorClass)}>
      <div className="flex flex-col justify-center">
        <h3 className="text-[8px] font-bold uppercase tracking-widest opacity-70 leading-none">{attempt}</h3>
        <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 leading-none">{date}</p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-heading font-bold leading-none">{Math.max(0, days)}</span>
        <span className="text-[8px] font-bold uppercase tracking-wide opacity-70">Days</span>
      </div>
    </div>
  );
}
