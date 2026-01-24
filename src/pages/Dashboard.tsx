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
    <div className="h-full flex flex-col gap-2 overflow-hidden p-2">
      {/* Top Row: Countdown & Stats - Natural Height, No Shrink */}
      <div className="grid grid-cols-12 gap-2 flex-none shrink-0 min-h-0">
         {/* Countdown (Spans 8) */}
         <div className="col-span-8 flex flex-col gap-1">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Clock className="h-3 w-3" /> Exam Schedule
            </h2>
            <div className="bg-card rounded-lg border border-border p-0 overflow-hidden shadow-sm h-24">
                <div className="h-full w-full">
                     <ExamCountdown />
                </div>
            </div>
         </div>

         {/* Overall Stats (Spans 4) */}
         <div className="col-span-4 flex flex-col gap-1">
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Trophy className="h-3 w-3" /> Progress
            </h2>
             <div className="bg-card rounded-lg border border-border p-3 shadow-sm flex items-center justify-between gap-3 h-24">
                <div>
                    <div className="text-3xl font-heading font-bold text-primary">{Math.round(overallProgress)}%</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Covered</div>
                </div>
                <div className="h-full w-px bg-border" />
                <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-2">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">{completedTopics}/{totalTopics}</span>
                     </div>
                     <StreakIndicator streak={streak.current_streak} />
                </div>
            </div>
         </div>
      </div>

      {/* Middle Row: Today's Strategic Goal & Domains - Natural Height */}
      <div className="grid grid-cols-12 gap-2 flex-none shrink-0 min-h-0">
          {/* Today's Goal (Spans 6) */}
          <div className="col-span-6 flex flex-col gap-1">
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Target className="h-3 w-3" /> Today's Goal
            </h2>
             {todaysPlan ? (
                 <div className="academic-card flex items-center justify-between p-4 relative overflow-hidden group h-32">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -translate-y-1/2 translate-x-1/2 rotate-45 pointer-events-none" />
                   
                   <div className="relative z-10 flex flex-col gap-1 max-w-[70%] justify-center">
                      <div className="flex items-center gap-2 text-primary">
                        <CalendarDays className="h-3 w-3" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{todaysPlan.type}</span>
                      </div>
                      <h2 className="text-lg font-heading font-bold text-foreground leading-tight line-clamp-2">{todaysPlan.title}</h2>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{todaysPlan.subtitle}</p>
                   </div>

                   <div className="relative z-10 flex items-center">
                     {todaysPlan.topicId ? (
                        <Button asChild size="sm" className="btn-academic-primary px-4 shadow-lg shadow-primary/20 h-8 text-xs">
                            <Link to={`/topic/${todaysPlan.topicId}`}>
                            Start <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </Button>
                     ) : (
                         <Button variant="outline" size="sm" className="btn-academic-secondary cursor-default h-8 text-xs">
                             Scheduled
                         </Button>
                     )}
                   </div>
                </div>
             ) : (
                <div className="academic-card flex items-center justify-center p-4 bg-secondary/10 h-32">
                     <p className="text-muted-foreground italic text-xs">No specific plan.</p>
                </div>
             )}
          </div>

           {/* Domains Grid (Spans 6) */}
           <div className="col-span-6 flex flex-col gap-1">
               <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <Map className="h-3 w-3" /> Domain Map
                    </h2>
                    <Link to="/syllabus" className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest">
                       All
                    </Link>
               </div>
               <div className="grid grid-cols-3 gap-2 h-auto min-h-[8rem]">
                     {sectionStats.slice(0, 3).map(({ section, completedCount, totalCount }) => (
                        <SectionCard
                        key={section.id}
                        section={section}
                        completedTopics={completedCount}
                        totalTopics={totalCount}
                        className="min-h-0 h-full"
                        />
                    ))}
                     {sectionStats.slice(3).map(({ section, completedCount, totalCount }) => (
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

      {/* Bottom Row: Calendar - Takes Remaining Space */}
      <div className="flex-1 flex flex-col gap-1 min-h-0 overflow-hidden">
           <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity className="h-3 w-3" /> Strategic Roadmap
            </h2>
            <div className="flex-1 min-h-0 bg-transparent">
                <StudyCalendar />
            </div>
      </div>
    </div>
  );
}
