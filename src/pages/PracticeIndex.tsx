import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useStaticData } from "@/hooks/useStaticData";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExamCountdown } from "@/components/ExamCountdown";

export default function PracticeIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { sections, getTopicsBySection, getQuestionsByTopic } = useStaticData();
  
  // Default to first section or from URL
  const activeSectionId = searchParams.get("section") || sections[0]?.id;

  const setActiveSection = (id: string) => {
      setSearchParams({ section: id });
  };

  const activeSection = sections.find(s => s.id === activeSectionId) || sections[0];
  const topics = activeSection ? getTopicsBySection(activeSection.id) : [];
  
  // Filter for topics with questions
  const topicsWithQuestions = topics.filter(
    (t) => getQuestionsByTopic(t.id).length > 0
  );

  // Helper to get session status
  const getTopicStatus = (topicId: string) => {
      const key = `cet_session_${topicId}`;
      const stored = localStorage.getItem(key);
      if(!stored) return "new";
      try {
          const sess = JSON.parse(stored);
          if (sess.isSubmitted) return "completed";
          return "in-progress";
      } catch {
          return "new";
      }
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      {/* Header Area: Title + Countdown */}
      <div className="flex-none grid grid-cols-12 gap-8 items-end border-b border-border pb-4 min-h-[140px]">
          <div className="col-span-8">
            <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">Practice Repository</h1>
            <p className="text-lg text-muted-foreground mt-2 font-sans italic">
            Select a domain competency to initiate an evaluative practice session.
            </p>
          </div>
          <div className="col-span-4 h-full">
               <ExamCountdown />
          </div>
      </div>

      {/* Main Content Area: Tabs + High Density Grid */}
      <div className="flex-1 min-h-0 flex flex-col gap-6">
          {/* Section Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto p-1.5 no-scrollbar flex-none">
              {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                        "px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all flex-shrink-0 border",
                        activeSectionId === section.id 
                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" 
                            : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground"
                    )}
                  >
                      {section.name}
                  </button>
              ))}
          </div>

          {/* Topics Grid - High Density 6 Cols */}
          <div className="flex-1 min-h-0 bg-secondary/5 border border-border/50 rounded-xl p-6 overflow-hidden">
              {topicsWithQuestions.length > 0 ? (
                  <div className="h-full grid grid-cols-6 gap-4 content-start">
                    {topicsWithQuestions.map((topic) => {
                        const questionCount = getQuestionsByTopic(topic.id).length;
                        const status = getTopicStatus(topic.id);
                        const isMock = activeSection?.id === "MOCKS";

                        return (
                            <Link
                            key={topic.id}
                            to={`/topic/${topic.id}`}
                            className={cn(
                                "academic-card flex flex-col justify-between p-4 transition-all duration-300",
                                "hover:bg-primary/5 hover:border-primary/20 group relative overflow-hidden",
                                "h-[120px]", // More compact height
                                status === "in-progress" && "border-l-4 border-l-blue-500 pl-3",
                                status === "completed" && "opacity-75",
                                isMock && "bg-amber-500/5 border-amber-500/20"
                            )}
                            >
                             <div className="relative z-10 w-full">
                                <div className="flex items-start justify-between w-full gap-2">
                                    <p className={cn(
                                        "font-heading font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 text-sm", 
                                        isMock && "text-base"
                                    )}>
                                        {topic.name}
                                    </p>
                                    <div className="shrink-0 pt-1">
                                         {status === "in-progress" && <Clock className="h-3 w-3 text-blue-500" />}
                                         {status === "completed" && <CheckCircle className="h-3 w-3 text-green-500" />}
                                    </div>
                                </div>
                                <div className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    {questionCount} ITEMS
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 relative z-10 self-end">
                                {status === "in-progress" ? "Resume" : "Start"}
                                <ArrowRight className="h-3 w-3" />
                            </div>
                            </Link>
                        );
                    })}
                  </div>
              ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground italic">
                      No topics available in this section.
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
