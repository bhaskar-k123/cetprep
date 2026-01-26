import { Link } from "react-router-dom";
import { useStaticData } from "@/hooks/useStaticData";
import { useTopicProgress, useStreak } from "@/hooks/useLocalStorage";
import { useStudyPlan } from "@/hooks/useStudyPlan";
import { SectionCard } from "@/components/SectionCard";
import { StreakIndicator } from "@/components/StreakIndicator";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, BookOpen, Target, Clock, CalendarDays, Map, Activity } from "lucide-react";
import { ExamCountdown } from "@/components/ExamCountdown";
import { StudyCalendar } from "@/components/StudyCalendar";
import { format } from "date-fns";

export default function Dashboard() {
   const { sections, getTopicsBySection } = useStaticData();
   const { getCompletedCount } = useTopicProgress();
   const { streak } = useStreak();
   const plan = useStudyPlan();

   // Get Today's Plan
   const todayStr = format(new Date(), "yyyy-MM-dd");
   const todaysPlan = plan[todayStr];

   // Calculate overall progress
   const sectionStats = sections.map((section) => {
      const topics = getTopicsBySection(section.id);
      const completedCount = getCompletedCount(topics.map((t) => t.id));
      return {
         section,
         completedCount,
         totalCount: topics.length,
      };
   });

   const totalTopics = sectionStats.reduce((sum, s) => sum + s.totalCount, 0);
   const completedTopics = sectionStats.reduce(
      (sum, s) => sum + s.completedCount,
      0
   );
   const overallProgress =
      totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

   return (
      <div className="h-full w-full flex flex-col gap-1 overflow-hidden">
         {/* Top Row: Countdown & Stats - Flexible but resistant to shrinking too much */}
         <div className="grid grid-cols-12 gap-1 flex-[0_0_auto] min-h-0">
            {/* Overall Stats (Spans 8 - Was 4) */}
            <div className="col-span-8 flex flex-col gap-1 h-full">
               <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-0">
                  <Trophy className="h-3 w-3" /> Progress
               </h2>
               <div className="bg-card rounded-lg border border-border px-6 py-2 shadow-sm flex items-center gap-6 flex-1 min-h-[3.5rem] max-h-[4rem]">
                  {/* Percentage */}
                  <div className="flex flex-col flex-none">
                     <div className="text-3xl font-heading font-bold text-primary leading-none">{Math.round(overallProgress)}%</div>
                     <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Covered</div>
                  </div>

                  {/* Visual Bar */}
                  <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0 px-2">
                     <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                           className="h-full bg-primary transition-all duration-500 ease-out"
                           style={{ width: `${Math.round(overallProgress)}%` }}
                        />
                     </div>
                  </div>

                  {/* Stats Group */}
                  <div className="flex items-center gap-4 flex-none border-l border-border pl-4">
                     <div className="flex flex-col items-center gap-0.5">
                        <BookOpen className="h-4 w-4 text-muted-foreground mb-0.5" />
                        <span className="text-xs font-bold text-foreground">{completedTopics}/{totalTopics}</span>
                        <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Topics</span>
                     </div>
                     <div className="flex flex-col items-center gap-0.5">
                        <StreakIndicator streak={streak.current_streak} className="mb-0.5" />
                        <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Streak</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Countdown (Spans 4 - Was 8) */}
            <div className="col-span-4 flex flex-col gap-1 h-full">
               <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-0">
                  <Clock className="h-3 w-3" /> Exam Schedule
               </h2>
               <div className="bg-card rounded-lg border border-border p-0 overflow-hidden shadow-sm flex-1 min-h-[3.5rem] max-h-[4rem]">
                  <div className="h-full w-full">
                     <ExamCountdown />
                  </div>
               </div>
            </div>
         </div>

         {/* Middle Row: Today's Strategic Goal & Domains - Flexible */}
         <div className="grid grid-cols-12 gap-1 flex-[0_0_auto] min-h-0">
            {/* Today's Goal (Spans 3) */}
            <div className="col-span-3 flex flex-col gap-1 h-full">
               <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-0">
                  <Target className="h-3 w-3" /> Today's Goal
               </h2>
               {todaysPlan ? (
                  <div className="academic-card flex items-center justify-between p-2 relative overflow-hidden group flex-1 min-h-[6.5rem]">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -translate-y-1/2 translate-x-1/2 rotate-45 pointer-events-none" />

                     <div className="relative z-10 flex flex-col gap-0.5 max-w-[70%] justify-center">
                        <div className="flex items-center gap-1.5 text-primary">
                           <CalendarDays className="h-3 w-3" />
                           <span className="text-[9px] font-bold uppercase tracking-widest">{todaysPlan.type}</span>
                        </div>
                        <h2 className="text-base font-heading font-bold text-foreground leading-tight line-clamp-1">{todaysPlan.title}</h2>
                        <p className="text-[9px] text-muted-foreground line-clamp-1 opacity-80">{todaysPlan.subtitle}</p>
                     </div>

                     <div className="relative z-10 flex items-center">
                        {todaysPlan.topicId ? (
                           <Button asChild size="sm" className="btn-academic-primary px-4 shadow-lg shadow-primary/20 h-7 text-xs">
                              <Link to={`/topic/${todaysPlan.topicId}`}>
                                 Start <ArrowRight className="ml-1 h-3 w-3" />
                              </Link>
                           </Button>
                        ) : (
                           <Button variant="outline" size="sm" className="btn-academic-secondary cursor-default h-7 text-xs">
                              Scheduled
                           </Button>
                        )}
                     </div>
                  </div>
               ) : (
                  <div className="academic-card flex items-center justify-center p-4 bg-secondary/10 flex-1 min-h-[5rem]">
                     <p className="text-muted-foreground italic text-xs">No specific plan.</p>
                  </div>
               )}
            </div>

            {/* Domains Grid (Spans 9) */}
            <div className="col-span-9 flex flex-col gap-1 h-full">
               <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-0">
                     <Map className="h-3 w-3" /> Domain Map
                  </h2>
                  <Link to="/syllabus" className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest">
                     All
                  </Link>
               </div>
               <div className="grid grid-cols-5 gap-2 flex-1 min-h-[6.5rem]">
                  {sectionStats.map(({ section, completedCount, totalCount }) => (
                     <SectionCard
                        key={section.id}
                        section={section}
                        completedTopics={completedCount}
                        totalTopics={totalCount}
                        className="min-h-0 h-full"
                     />
                  ))}
               </div>
            </div>
         </div>

         {/* Bottom Row: Calendar - Takes Remaining Space (flex-1) */}
         <div className="flex-1 flex flex-col gap-1 min-h-0 overflow-hidden">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-0">
               <Activity className="h-3 w-3" /> Strategic Roadmap
            </h2>
            <div className="flex-1 min-h-0 bg-transparent">
               <StudyCalendar />
            </div>
         </div>
      </div>
   );
}
