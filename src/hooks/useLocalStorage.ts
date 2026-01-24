import { useState, useEffect, useCallback } from "react";
import { TopicProgress, QuestionAttempt, StreakData } from "@/types";

const TOPIC_PROGRESS_KEY = "cet_topic_progress";
const QUESTION_ATTEMPTS_KEY = "cet_question_attempts";
const STREAK_KEY = "cet_streak_data";

// Hook for topic progress persistence
export function useTopicProgress() {
  const [progress, setProgress] = useState<Record<string, TopicProgress>>({});

  useEffect(() => {
    const stored = localStorage.getItem(TOPIC_PROGRESS_KEY);
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch {
        setProgress({});
      }
    }
  }, []);

  const toggleTopicCompletion = useCallback((topicId: string) => {
    setProgress((prev) => {
      const existing = prev[topicId];
      const updated = {
        ...prev,
        [topicId]: {
          topic_id: topicId,
          completed: !existing?.completed,
          completed_at: !existing?.completed ? new Date().toISOString() : undefined,
        },
      };
      localStorage.setItem(TOPIC_PROGRESS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isTopicCompleted = useCallback(
    (topicId: string): boolean => {
      return progress[topicId]?.completed ?? false;
    },
    [progress]
  );

  const getCompletedCount = useCallback(
    (topicIds: string[]): number => {
      return topicIds.filter((id) => progress[id]?.completed).length;
    },
    [progress]
  );

  return { progress, toggleTopicCompletion, isTopicCompleted, getCompletedCount };
}

// Hook for question attempts persistence
export function useQuestionAttempts() {
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(QUESTION_ATTEMPTS_KEY);
    if (stored) {
      try {
        setAttempts(JSON.parse(stored));
      } catch {
        setAttempts([]);
      }
    }
  }, []);

  const recordAttempt = useCallback(
    (
      questionId: string,
      selectedOption: "A" | "B" | "C" | "D" | "E",
      isCorrect: boolean,
      timeSpentSec?: number
    ) => {
      const newAttempt: QuestionAttempt = {
        id: `${questionId}-${Date.now()}`,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
        time_spent_sec: timeSpentSec,
        attempted_at: new Date().toISOString(),
      };

      setAttempts((prev) => {
        const updated = [...prev, newAttempt];
        localStorage.setItem(QUESTION_ATTEMPTS_KEY, JSON.stringify(updated));
        return updated;
      });

      return newAttempt;
    },
    []
  );

  const getAttemptsForQuestion = useCallback(
    (questionId: string): QuestionAttempt[] => {
      return attempts.filter((a) => a.question_id === questionId);
    },
    [attempts]
  );

  const getAccuracy = useCallback(
    (topicId?: string, sectionId?: string): { correct: number; total: number } => {
      // This would need question data to filter by topic/section
      // For now, return overall accuracy
      const correct = attempts.filter((a) => a.is_correct).length;
      return { correct, total: attempts.length };
    },
    [attempts]
  );

  return { attempts, recordAttempt, getAttemptsForQuestion, getAccuracy };
}

// Hook for streak tracking
export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({
    current_streak: 0,
    last_activity_date: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored) as StreakData;
        // Check if streak is still valid
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const lastDate = new Date(data.last_activity_date).toDateString();

        if (lastDate === today) {
          setStreak(data);
        } else if (lastDate === yesterday) {
          setStreak(data);
        } else {
          // Streak broken
          setStreak({ current_streak: 0, last_activity_date: "" });
        }
      } catch {
        setStreak({ current_streak: 0, last_activity_date: "" });
      }
    }
  }, []);

  const recordActivity = useCallback(() => {
    setStreak((prev) => {
      const today = new Date().toDateString();
      const lastDate = prev.last_activity_date
        ? new Date(prev.last_activity_date).toDateString()
        : "";

      if (lastDate === today) {
        return prev; // Already recorded today
      }

      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak =
        lastDate === yesterday ? prev.current_streak + 1 : 1;

      const updated = {
        current_streak: newStreak,
        last_activity_date: new Date().toISOString(),
      };

      localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { streak, recordActivity };
}
