import { Link, useParams, useNavigate } from "react-router-dom";
import { useStaticData } from "@/hooks/useStaticData";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/PriorityBadge";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Strategy } from "@/types";

export default function TopicDetail() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { getTopicById, getSectionById, getQuestionsByTopic, getStrategiesBySection } =
    useStaticData();

  const topic = topicId ? getTopicById(topicId) : undefined;
  const section = topic ? getSectionById(topic.section_id) : undefined;
  const questions = topicId ? getQuestionsByTopic(topicId) : [];
  const strategies: Strategy[] = section ? getStrategiesBySection(section.id) : [];

  if (!topic) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Topic Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The requested topic does not exist.
        </p>
        <Button asChild variant="outline">
          <Link to="/syllabus">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Syllabus
          </Link>
        </Button>
      </div>
    );
  }

  const handleStartPractice = () => {
    if (questions.length > 0) {
      navigate(`/practice/${topicId}`);
    }
  };

  return (
    <div className="container-centered py-1 max-w-4xl">
      {/* Back Link */}
      <Link
        to="/syllabus"
        className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-primary mb-1 uppercase tracking-widest transition-all"
      >
        <ArrowLeft className="mr-2 h-3.3 w-3.5" />
        Back to Syllabus
      </Link>

      {/* Topic Header */}
      <div className="mb-2 border-b border-border pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-heading font-bold text-foreground leading-tight">{topic.name}</h1>
            <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase">
              <span className="text-muted-foreground">{section?.name}</span>
              <span className="text-border">•</span>
              <PriorityBadge priority={topic.priority} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strategy & Guidance (Spans 2 cols) */}
        <div className="md:col-span-2 space-y-2">
          {strategies.length > 0 && (
            <div className="academic-card p-4 space-y-2">
              <h2 className="text-xl font-heading font-bold flex items-center gap-3 text-foreground mb-0">
                <BookOpen className="h-5 w-5 text-primary" />
                Strategic Guidance
              </h2>
              <div className="prose prose-slate max-w-none text-muted-foreground font-sans leading-relaxed text-sm italic border-l-2 border-primary/20 pl-4">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="whitespace-pre-wrap">
                    {strategy.content
                      .split("\n")
                      .filter((line) => !line.startsWith("#"))
                      .join("\n")
                      .trim()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Practice CTA (Side Sidebar style) */}
        <div className="space-y-4">
          <div className="academic-card p-3 text-center bg-primary/5 border-primary/20">
            {questions.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-3xl font-heading font-bold text-primary">{questions.length}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    Available Assessments
                  </div>
                </div>
                <Button onClick={handleStartPractice} size="lg" className="btn-academic-primary w-full shadow-lg shadow-primary/10">
                  Begin Practice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-muted-foreground font-sans text-sm italic">
                  Assessments are currently being curated for this competency.
                </p>
                <Button asChild variant="outline" className="btn-academic-secondary w-full">
                  <Link to="/syllabus">Other Domains</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
