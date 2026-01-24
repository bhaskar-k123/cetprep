// Core Types based on DATABASE_DESIGN.md

export interface Section {
  id: string; // LR, AR, QA, VARC
  name: string;
  total_questions: number;
  order: number;
}

export type Priority = "High" | "Medium" | "Low";

export interface Topic {
  id: string;
  section_id: string;
  name: string;
  priority: Priority;
  weightage: number;
  is_active: boolean;
  order: number;
}

export interface Question {
  id: string;
  topic_id: string;
  section_id: string;
  
  // Text content (optional if image exists)
  question_text: string | null;
  question_image?: string | null;
  
  // Instructions/Paragraph for set-based questions
  instruction_text?: string;

  // Options
  option_a: string | null;
  option_a_image?: string | null;
  
  option_b: string | null;
  option_b_image?: string | null;
  
  option_c: string | null;
  option_c_image?: string | null;
  
  option_d: string | null;
  option_d_image?: string | null;

  option_e?: string | null;
  option_e_image?: string | null;

  correct_option: "A" | "B" | "C" | "D" | "E";
  explanation: string | null;
  
  difficulty?: "Easy" | "Medium" | "Hard" | "Unknown";
  source?: string;
  is_active: boolean;
  has_images?: boolean;
}

export interface TopicProgress {
  topic_id: string;
  completed: boolean;
  completed_at?: string;
}

export interface QuestionAttempt {
  id: string;
  question_id: string;
  selected_option: "A" | "B" | "C" | "D" | "E";
  is_correct: boolean;
  time_spent_sec?: number;
  attempted_at: string;
}

export interface Strategy {
  id: string;
  section_id: string | null;
  topic_id: string | null;
  title: string;
  content: string;
}

// Practice Session State (in-memory)
export interface PracticeSession {
  topic_id: string;
  questions: Question[];
  current_index: number;
  answers: Record<string, "A" | "B" | "C" | "D" | "E" | null>;
  marked_for_review: Set<string>;
  submitted: Set<string>;
}

// Streak tracking
export interface StreakData {
  current_streak: number;
  last_activity_date: string;
}
