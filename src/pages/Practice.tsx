import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useStaticData } from "@/hooks/useStaticData";
import { useQuestionAttempts, useStreak } from "@/hooks/useLocalStorage";
import { usePracticeSession } from "@/hooks/usePracticeSession";
import { QuestionCard } from "@/components/QuestionCard";
import { QuestionNavigator } from "@/components/QuestionNavigator";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Check,
  X,
  Maximize2,
  Minimize2,
  Clock,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type PracticePhase = "practice" | "review" | "summary";

export default function Practice() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { getTopicById, getQuestionsByTopic, getSectionById } = useStaticData();
  const { recordAttempt } = useQuestionAttempts();
  const { recordActivity } = useStreak();

  const topic = topicId ? getTopicById(topicId) : undefined;
  const section = topic ? getSectionById(topic.section_id) : undefined;
  const questions = topicId ? getQuestionsByTopic(topicId) : [];

  // Determine if this is a Mock Test (150 mins = 9000s)
  const isMockTest = section?.id === "MOCKS";
  const MOCK_DURATION = 150 * 60;

  // Session Persistence
  const {
    session,
    isLoading: isSessionLoading,
    saveSession,
    initializeSession,
    clearSession
  } = usePracticeSession(topicId || "", isMockTest ? MOCK_DURATION : 0);

  // Local State (mirroring session state for immediate UI feedback, syncing back to session)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, "A" | "B" | "C" | "D" | "E" | null>
  >({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [showExplanation, setShowExplanation] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<PracticePhase>("practice");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isInstantFeedback, setIsInstantFeedback] = useState(false);

  // Timer State
  const [timeRemaining, setTimeRemaining] = useState<number>(isMockTest ? MOCK_DURATION : 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or Restore Logic
  useEffect(() => {
    if (!isSessionLoading && topicId) {
      if (session) {
        // Restore session
        setCurrentIndex(session.currentIndex);
        setAnswers(session.answers);
        setMarkedForReview(new Set(session.markedForReview));
        setTimeRemaining(session.timeRemaining);

        // If session was already submitted, go to summary/review? 
        if (session.isSubmitted) {
          setPhase("summary");
          // Mark all answered as submitted for logic consistency
          const sub = new Set<string>();
          Object.keys(session.answers).forEach(k => {
            if (session.answers[k]) sub.add(k);
          });
          setSubmitted(sub);
        } else {
          // Recovering an active session
          const sub = new Set<string>();
          Object.keys(session.answers).forEach(k => {
            // Only if we consider previously saved answers as "submitted" in practice mode?
            // For mocks, we usually construct answers and submit at end.
            // For practice, we submit per question.
            // Let's assume for now persistence restores STATE, but "submitted" status per question 
            // is lost in current schema (we only stored isSubmitted globally). 
            // If we want to persist per-question submission status, we need to add it to schema.
            // For now, let's treat restored answers as "selected but not validated" 
            // OR "validated" if we check against attempts? 
            // Let's keep it simple: answers are restored. User can re-validate or continue.
          });
        }

      } else {
        // New Session
        initializeSession(isMockTest ? MOCK_DURATION : 0);
      }
    }
  }, [isSessionLoading, topicId, session, isMockTest, initializeSession, MOCK_DURATION]);

  // Sync state to session (Debounced)
  useEffect(() => {
    if (!isSessionLoading && session && topicId) {
      const timeoutId = setTimeout(() => {
        saveSession({
          answers,
          currentIndex,
          markedForReview: Array.from(markedForReview),
          timeRemaining,
          isSubmitted: phase !== "practice"
        });
      }, 1000); // Debounce by 1s (effectively saves every 1s if continuous, but cleaner if we increased delay)
      // Actually, for timer, we want it to save periodically.
      // A better pattern for timer-heavy apps is to save every X seconds, not on every change.
      // But here we depend on `timeRemaining` changing every second.
      // Let's rely on the fact that `usePracticeSession` usually wraps setState.

      return () => clearTimeout(timeoutId);
    }
  }, [answers, currentIndex, markedForReview, timeRemaining, phase, isSessionLoading, session, topicId, saveSession]);

  // Timer Logic
  useEffect(() => {
    if (phase === "practice" && isMockTest) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Auto Submit
            handleFinishPractice();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isMockTest]); // handleFinishPractice dependency loop?

  const currentQuestion = questions[currentIndex];
  const questionIds = questions.map((q) => q.id);

  // Record activity for streak
  useEffect(() => {
    if (questions.length > 0) {
      recordActivity();
    }
  }, [questions.length, recordActivity]);

  const handleSelectOption = useCallback(
    (option: "A" | "B" | "C" | "D" | "E") => {
      // Allow interaction even if submitted (for re-attempts)
      if (!currentQuestion) return;

      const currentAnswer = answers[currentQuestion.id];

      // Toggle Logic: If clicking the same option, Deselect/Clear
      if (currentAnswer === option) {
        setAnswers((prev) => {
          const next = { ...prev };
          delete next[currentQuestion.id]; // Remove answer
          return next;
        });
        // Also clear submission status to reset UI colors
        setSubmitted((prev) => {
          const next = new Set(prev);
          next.delete(currentQuestion.id);
          return next;
        });
        return;
      }

      // New Selection Logic
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));

      if (isInstantFeedback) {
        const isCorrect = option === currentQuestion.correct_option;
        recordAttempt(currentQuestion.id, option, isCorrect);
        setSubmitted((prev) => new Set(prev).add(currentQuestion.id));
      } else {
        // If switching answer in manual mode, ensure we reset "submitted" if it was previously submitted
        // actually, if we want to allow re-attempt in manual mode too, we should clear submitted until they click validate again?
        // User asked for "remove validation". So yes, if they switch, it should probably reset to "Unvalidated" state until they click Validate.
        setSubmitted((prev) => {
          const next = new Set(prev);
          next.delete(currentQuestion.id);
          return next;
        });
      }
    },
    [currentQuestion, answers, isInstantFeedback, recordAttempt]
  );

  const handleSubmitAnswer = useCallback(() => {
    if (!currentQuestion || submitted.has(currentQuestion.id)) return;
    const selectedOption = answers[currentQuestion.id];
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentQuestion.correct_option;
    recordAttempt(currentQuestion.id, selectedOption, isCorrect);
    setSubmitted((prev) => new Set(prev).add(currentQuestion.id));
  }, [currentQuestion, answers, submitted, recordAttempt]);

  const handleNavigate = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) {
        setCurrentIndex(index);
      }
    },
    [questions.length]
  );

  const handleNext = useCallback(() => {
    handleNavigate(currentIndex + 1);
  }, [currentIndex, handleNavigate]);

  const handlePrevious = useCallback(() => {
    handleNavigate(currentIndex - 1);
  }, [currentIndex, handleNavigate]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== "practice") return;

      switch (e.key) {
        case "a":
        case "A":
          handleSelectOption("A");
          break;
        case "b":
        case "B":
          handleSelectOption("B");
          break;
        case "c":
        case "C":
          handleSelectOption("C");
          break;
        case "d":
        case "D":
          handleSelectOption("D");
          break;
        case "e":
        case "E":
          handleSelectOption("E");
          break;
        case "Enter":
          if (!submitted.has(currentQuestion?.id || "")) {
            handleSubmitAnswer();
          } else if (currentIndex < questions.length - 1) {
            handleNext();
          }
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "ArrowLeft":
          handlePrevious();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    phase,
    handleSelectOption,
    handleSubmitAnswer,
    handleNext,
    handlePrevious,
    currentQuestion,
    submitted,
    currentIndex,
    questions.length,
  ]);

  const handleToggleExplanation = useCallback(() => {
    if (!currentQuestion) return;
    setShowExplanation((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  }, [currentQuestion]);

  const handleToggleMarkForReview = useCallback(() => {
    if (!currentQuestion) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  }, [currentQuestion]);

  const handleFinishPractice = useCallback(() => {
    setPhase("summary");
    // Also save final state
    if (session && topicId) {
      saveSession({ isSubmitted: true, timeRemaining: 0 });
    }
  }, [session, topicId, saveSession]);

  const handleReviewAnswers = useCallback(() => {
    setPhase("review");
    setCurrentIndex(0);
  }, []);

  const handleExit = useCallback(() => {
    navigate(`/topic/${topicId}`); // Or section page?
  }, [navigate, topicId]);

  const handleReset = useCallback(() => {
    if (confirm("Are you sure you want to reset this session? All progress will be lost.")) {
      clearSession();
      window.location.reload();
    }
  }, [clearSession]);

  // Format Time
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  if (isSessionLoading) {
    return <div className="flex h-screen items-center justify-center">Loading Session...</div>;
  }

  if (!topic || questions.length === 0) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-heading font-semibold mb-2">No Questions Available</h1>
        <p className="text-muted-foreground mb-4">
          This topic doesn't have any practice questions yet.
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

  // Summary phase
  if (phase === "summary") {
    const answeredCount = Object.keys(answers).filter(
      (id) => answers[id] !== null
    ).length;
    const correctCount = questions.filter(
      (q) => answers[q.id] === q.correct_option
    ).length;
    const markedCount = markedForReview.size;

    return (
      <div className="container-centered py-16 max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-heading font-bold text-foreground mb-4">Competency Assessment Complete</h1>
          <p className="text-xl text-muted-foreground font-sans italic">{topic.name}</p>
        </div>

        <div className="academic-card p-10 mb-10 border-primary/20 bg-primary/5">
          <h2 className="text-2xl font-heading font-bold mb-8 text-center uppercase tracking-widest border-b border-primary/10 pb-4">Performance Metrics</h2>
          <div className="space-y-4 font-sans divide-y divide-primary/5">
            <div className="flex items-center justify-between py-4">
              <span className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Total Questions</span>
              <span className="text-2xl font-heading font-bold">{questions.length}</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Answered</span>
              <span className="text-2xl font-heading font-bold">{answeredCount}</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-primary font-bold tracking-widest uppercase text-xs">Correct Responses</span>
              <span className="text-3xl font-heading font-bold text-primary">{correctCount}</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-destructive font-bold tracking-widest uppercase text-xs">Incorrect Responses</span>
              <span className="text-2xl font-heading font-bold text-destructive">
                {answeredCount - correctCount}
              </span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Marked for Review</span>
              <span className="text-2xl font-heading font-bold">{markedCount}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-6">
          <Button variant="outline" onClick={handleReviewAnswers} className="btn-academic-secondary px-8">
            Review Responses
          </Button>
          <Button onClick={handleExit} className="btn-academic-primary px-10">
            Exit
          </Button>
        </div>
      </div>
    );
  }

  const isCurrentSubmitted = currentQuestion
    ? submitted.has(currentQuestion.id)
    : false;
  const isCurrentCorrect = currentQuestion
    ? answers[currentQuestion.id] === currentQuestion.correct_option
    : false;
  const isMarked = currentQuestion
    ? markedForReview.has(currentQuestion.id)
    : false;
  const isReviewPhase = phase === "review";

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Main Content */}
      <div className={cn(
        "flex-1 p-10 overflow-auto transition-all duration-300",
        isFocusMode ? "max-w-5xl mx-auto" : ""
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-12 border-b border-border pb-6">
          <div className="flex items-center gap-6">
            <Link
              to={`/topic/${topicId}`}
              className="p-2 border border-border bg-secondary text-muted-foreground hover:text-primary hover:border-primary/30 transition-all rounded-[var(--radius)]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-heading font-bold text-3xl tracking-tight leading-tight">{topic.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  ASSESSMENT ITEM {currentIndex + 1} OF {questions.length}
                </p>
                {isMockTest && (
                  <div className={cn("flex items-center gap-2 text-sm font-bold font-mono px-3 py-1 rounded bg-secondary border border-border", timeRemaining < 300 ? "text-destructive" : "text-muted-foreground")}>
                    <Clock className="h-3 w-3" />
                    {formatTime(timeRemaining)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isReviewPhase && !isMockTest && (
              <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-[var(--radius)] border border-border/50">
                <Switch
                  id="instant-feedback"
                  checked={isInstantFeedback}
                  onCheckedChange={setIsInstantFeedback}
                />
                <Label htmlFor="instant-feedback" className="text-xs font-bold uppercase tracking-widest text-muted-foreground cursor-pointer">
                  Instant Feedback
                </Label>
              </div>
            )}

            {!isReviewPhase && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title="Reset Session"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <Button
                  variant={isMarked ? "default" : "outline"}
                  size="sm"
                  onClick={handleToggleMarkForReview}
                  className={cn(
                    "btn-academic border-border",
                    isMarked ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground"
                  )}
                >
                  <Star
                    className={cn(
                      "h-4 w-4 mr-2",
                      isMarked && "fill-current"
                    )}
                  />
                  {isMarked ? "REVIEW MARK" : "MARK FOR REVIEW"}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="text-muted-foreground hover:text-primary transition-colors"
              title="Toggle Focus Mode"
            >
              {isFocusMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Question Area */}
        <div className="max-w-4xl mx-auto">
          <QuestionCard
            key={currentQuestion?.id}
            question={currentQuestion}
            selectedOption={answers[currentQuestion.id] || null}
            isSubmitted={isCurrentSubmitted || isReviewPhase}
            onSelectOption={handleSelectOption}
            showExplanation={
              (isCurrentSubmitted || isReviewPhase) &&
              showExplanation.has(currentQuestion.id)
            }
            className="mb-12"
          />

          {/* Feedback & Actions */}
          {(isCurrentSubmitted || isReviewPhase) && (
            <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div
                className={cn(
                  "flex items-center gap-6 p-6 border-l-4",
                  isCurrentCorrect
                    ? "border-l-primary bg-primary/5"
                    : "border-l-destructive bg-destructive/5"
                )}
              >
                <div className={cn(
                  "p-2 bg-card border",
                  isCurrentCorrect ? "text-primary border-primary/20" : "text-destructive border-destructive/20"
                )}>
                  {isCurrentCorrect ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className={cn(
                    "font-heading font-bold text-xl",
                    isCurrentCorrect ? "text-primary" : "text-destructive"
                  )}>
                    {isCurrentCorrect ? "VALIDATED RESPONSE" : "INCORRECT RESPONSE"}
                  </h3>
                  {!isCurrentCorrect && (
                    <p className="text-sm font-bold text-muted-foreground mt-1 tracking-widest uppercase">
                      Correct: {currentQuestion.correct_option}
                    </p>
                  )}
                </div>
              </div>

              {!isCurrentCorrect && (
                <Button variant="outline" size="sm" onClick={handleToggleExplanation} className="btn-academic-secondary w-full sm:w-auto tracking-widest text-[10px] uppercase font-bold px-6">
                  {showExplanation.has(currentQuestion.id)
                    ? "CONCEAL EXPLANATION"
                    : "DIVULGE EXPLANATION"}
                </Button>
              )}
            </div>
          )}

          {/* Submit / Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="text-muted-foreground hover:text-primary transition-all font-bold tracking-widest text-[10px] uppercase"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              PRIOR ITEM
            </Button>

            <div className="flex gap-4">
              {/* Only show "Validate" check for non-mock practice mode? For mocks user usually submits at end. 
                  But user asked for "flexible". Let's update Practice Mode to not auto-submit on click? 
                  Or keep as is for now: Practice = Immediate Feedback. Mock = Time based? 
                  Let's assume "MOCKS" don't show immediate feedback? 
                  Current impl: `isCurrentSubmitted` controls feedback. 
                  If we want Mocks to be "test mode", we shouldn't show feedback immediately. 
                  
                  Let's modify: If Mock Test, "Validate Answer" button should probably be "Save & Next"?
               */}

              {(!isReviewPhase && !isCurrentSubmitted && !isMockTest && !isInstantFeedback) && (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!answers[currentQuestion.id]}
                  className="btn-academic-primary min-w-[160px] shadow-lg shadow-primary/10"
                >
                  VALIDATE ANSWER
                </Button>
              )}

              {currentIndex === questions.length - 1 ? (
                <Button
                  onClick={isReviewPhase ? handleExit : handleFinishPractice}
                  variant={isReviewPhase ? "outline" : "default"}
                  className={isReviewPhase ? "btn-academic-secondary" : "btn-academic-primary"}
                >
                  {isReviewPhase ? "TERMINATE" : "CONCLUDE ASSESSMENT"}
                </Button>
              ) : (
                <Button variant={isCurrentSubmitted ? "default" : "outline"} onClick={handleNext} className={cn("min-w-[120px] transition-all", isCurrentSubmitted ? "btn-academic-primary" : "btn-academic-secondary")}>
                  NEXT ITEM
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          <div className="mt-12 flex justify-center gap-10 text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">
            <span className="flex items-center gap-2"><kbd className="border border-border bg-card px-2 py-1 rounded-none">A-E</kbd> SELECT</span>
            <span className="flex items-center gap-2"><kbd className="border border-border bg-card px-2 py-1 rounded-none">ENTER</kbd> VALIDATE</span>
            <span className="flex items-center gap-2"><kbd className="border border-border bg-card px-2 py-1 rounded-none">→</kbd> NEXT</span>
          </div>
        </div>
      </div>

      {/* Sidebar Navigator */}
      {!isFocusMode && (
        <div className="w-80 shrink-0 border-l border-border bg-background p-8 hidden lg:block overflow-y-auto">
          {/* Show Exam/Mock Info if Mock */}
          {isMockTest && (
            <div className="mb-6 p-4 rounded bg-primary/5 border border-primary/20">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Time Remaining</div>
              <div className={cn("text-3xl font-mono font-bold", timeRemaining < 300 ? "text-destructive" : "text-foreground")}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          )}

          <QuestionNavigator
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            answeredQuestions={
              new Set(
                Object.entries(answers)
                  .filter(([, v]) => v !== null)
                  .map(([k]) => k)
              )
            }
            markedQuestions={markedForReview}
            questionIds={questionIds}
            onNavigate={handleNavigate}
          />
        </div>
      )}
    </div>
  );
}
