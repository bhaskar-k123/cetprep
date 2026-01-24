
import { differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

export function ExamCountdown() {
  const today = new Date();
  
  // MBA CET Dates 2026 (Hypothetical based on request)
  // Request said: "from the 2 attempts i.e April 6 and May 9 from the current date"
  // Assuming current date as in prompt metadata is 2026-01-24. 
  // Let's set targets for 2026.
  
  const attempt1Date = new Date("2026-04-06");
  const attempt2Date = new Date("2026-05-09");

  const daysToAttempt1 = differenceInDays(attempt1Date, today);
  const daysToAttempt2 = differenceInDays(attempt2Date, today);

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <CountdownCard 
        title="Attempt 1 (Apr 6)" 
        days={daysToAttempt1} 
        colorClass="bg-blue-500/10 border-blue-500/20 text-blue-700" 
      />
      <CountdownCard 
        title="Attempt 2 (May 9)" 
        days={daysToAttempt2} 
        colorClass="bg-purple-500/10 border-purple-500/20 text-purple-700" 
      />
    </div>
  );
}

function CountdownCard({ title, days, colorClass }: { title: string, days: number, colorClass: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-4 rounded-lg border h-full", colorClass)}>
       <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">{title}</h3>
       <div className="text-4xl font-heading font-bold leading-none">
         {Math.max(0, days)}
       </div>
       <p className="text-[10px] font-medium mt-1 uppercase tracking-wide opacity-60">Days Left</p>
    </div>
  );
}
