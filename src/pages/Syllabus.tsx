import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStaticData } from "@/hooks/useStaticData";
import { useTopicProgress } from "@/hooks/useLocalStorage";
import { TopicRow } from "@/components/TopicRow";
import { ProgressBar } from "@/components/ProgressBar";
import { cn } from "@/lib/utils";

export default function Syllabus() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { sections, getTopicsBySection, getQuestionsByTopic } = useStaticData();
  const { isTopicCompleted, toggleTopicCompletion, getCompletedCount } =
    useTopicProgress();

  // Active section state (Synced with URL)
  const activeSectionId = searchParams.get("section") || sections[0]?.id;
  const setActiveSection = (id: string) => {
    setSearchParams({ section: id });
  };

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const topics = activeSection ? getTopicsBySection(activeSection.id) : [];
  
  // Progress stats for active section
  const completedCount = getCompletedCount(topics.map((t) => t.id));
  const progress = topics.length > 0 ? (completedCount / topics.length) * 100 : 0;
  
  // Global stats
  const { questions } = useStaticData();
  
  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      {/* Header Area */}
      <div className="flex-none border-b border-border pb-4 min-h-[100px] flex flex-col justify-end">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-heading font-bold text-foreground">Academic Syllabus</h1>
            <p className="text-lg text-muted-foreground mt-1 font-sans">
              A comprehensive overview of required competencies for the MAH CET.
            </p>
          </div>
          <div className="academic-card px-4 py-2 bg-primary/5 border-primary/20 flex flex-col items-center">
            <span className="text-2xl font-bold text-primary">{questions.length}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Total Library</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col gap-6">
        {/* Section Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto p-1 no-scrollbar flex-none">
          {sections.map((section) => (
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

        {/* Selected Section Content */}
        <div className="flex-1 min-h-0 bg-background border border-border rounded-xl flex flex-col overflow-hidden shadow-sm">
            {/* Section Header & Stats */}
            <div className="flex-none p-6 border-b border-border bg-secondary/10 flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-heading font-bold">{activeSection.name}</h2>
                   <div className="flex items-center gap-2 mt-2">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{topics.length} TOPICS</span>
                       <span className="w-1 h-1 rounded-full bg-border" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{Math.round(progress)}% COMPLETE</span>
                   </div>
                </div>
                <div className="w-1/3 max-w-xs">
                    <ProgressBar value={progress} showLabel={false} className="h-2" />
                </div>
            </div>

            {/* Dense Grid List No Scroll if fits */}
            <div className="flex-1 overflow-auto p-6 scrollbar-thin">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 h-full content-start">
                  {topics.map((topic) => {
                      const count = getQuestionsByTopic(topic.id).length;
                      return (
                        <TopicRow
                            key={topic.id}
                            topic={topic}
                            questionCount={count}
                            isCompleted={isTopicCompleted(topic.id)}
                            onToggleComplete={() => toggleTopicCompletion(topic.id)}
                            className="p-3 border rounded-lg hover:border-primary/50 transition-colors bg-card"
                        />
                      );
                  })}
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
