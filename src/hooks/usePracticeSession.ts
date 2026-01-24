
import { useState, useEffect, useCallback } from "react";

export interface PracticeSessionState {
  answers: Record<string, "A" | "B" | "C" | "D" | "E" | null>;
  currentIndex: number;
  timeRemaining: number; // in seconds
  isSubmitted: boolean; // aka "Concluded"
  markedForReview: string[]; // Set is not serializable
  startTime: string;
  lastActive: string;
  totalTimeSpent: number; // tracked active time
}

const SESSION_PREFIX = "cet_session_";

export function usePracticeSession(topicId: string, initialDurationSeconds?: number) {
  const [session, setSession] = useState<PracticeSessionState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    const key = `${SESSION_PREFIX}${topicId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Validate or migrate schema if needed
        setSession(parsed);
      } catch (e) {
        console.error("Failed to parse session", e);
      }
    }
    setIsLoading(false);
  }, [topicId]);

  // Save session functionality
  const saveSession = useCallback((newState: Partial<PracticeSessionState>) => {
    setSession((prev) => {
      // If we don't have a previous session, we can't really "update" it properly 
      // without default values, but usually we initialize before calling save.
      // For safety, providing defaults if prev is null (should happen in init though).
      const base = prev || {
        answers: {},
        currentIndex: 0,
        timeRemaining: initialDurationSeconds || 0,
        isSubmitted: false,
        markedForReview: [],
        startTime: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        totalTimeSpent: 0
      };

      const updated = { ...base, ...newState, lastActive: new Date().toISOString() };
      
      localStorage.setItem(`${SESSION_PREFIX}${topicId}`, JSON.stringify(updated));
      return updated;
    });
  }, [topicId, initialDurationSeconds]);

  // Initializer
  const initializeSession = useCallback((durationSeconds: number) => {
    const newSession: PracticeSessionState = {
      answers: {},
      currentIndex: 0,
      timeRemaining: durationSeconds,
      isSubmitted: false,
      markedForReview: [],
      startTime: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      totalTimeSpent: 0
    };
    localStorage.setItem(`${SESSION_PREFIX}${topicId}`, JSON.stringify(newSession));
    setSession(newSession);
  }, [topicId]);

  const clearSession = useCallback(() => {
    localStorage.removeItem(`${SESSION_PREFIX}${topicId}`);
    setSession(null);
  }, [topicId]);

  return {
    session,
    isLoading,
    saveSession,
    initializeSession,
    clearSession
  };
}
