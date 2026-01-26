import { useMemo } from "react";
import { addDays, differenceInDays, format, isBefore, isSameDay, startOfDay } from "date-fns";
import { useStaticData } from "./useStaticData";
import { Topic } from "@/types";

export type PlanItemType = "topic" | "mock" | "revision" | "rest";

export interface PlanItem {
    date: Date;
    dateString: string; // YYYY-MM-DD for easy lookup
    type: PlanItemType;
    title: string;
    subtitle?: string;
    topicId?: string;
    isCompleted?: boolean;
    priority?: "High" | "Medium" | "Low";
}

export function useStudyPlan() {
    const { topics, sections } = useStaticData();

    // Dates
    const today = startOfDay(new Date()); // Should be 2026-01-24 based on prompt metadata
    const attempt1Date = new Date("2026-04-06");
    const attempt2Date = new Date("2026-05-09");

    const plan = useMemo(() => {
        const generatedPlan: Record<string, PlanItem> = {};

        // Helper to add item
        const addItem = (date: Date, item: Omit<PlanItem, "date" | "dateString">) => {
            const dateStr = format(date, "yyyy-MM-dd");
            generatedPlan[dateStr] = {
                ...item,
                date,
                dateString: dateStr
            };
        };

        // --- Phase 1: Foundation (Today -> 20 days before Attempt 1) ---
        // Goal: Cover all topics. High priority first.
        // Duration calculation
        const daysUntilAttempt1 = differenceInDays(attempt1Date, today);
        const intensivePhaseStart = 20; // Start intensive mocks 20 days before
        const foundationDays = Math.max(0, daysUntilAttempt1 - intensivePhaseStart);

        // Sort topics by priority for scheduling
        // Order: High Priority first, then weightage, then section order
        const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
        const sortedTopics = [...topics].sort((a, b) => {
            const pA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
            const pB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
            if (pB !== pA) return pB - pA; // Descending priority
            return (b.weightage || 0) - (a.weightage || 0); // Descending weightage
        });

        // Schedule Topics
        // We have `sortedTopics.length` topics to cover in `foundationDays`.
        // If foundationDays is large, we spread them out. If small, we might double up?
        // Let's assume 1 topic per day for simplicity, or 2 if needed.
        // Actually, simply allocate 1 topic per day sequentially.
        // If we run out of topics, fill with "Revision".
        // If we run out of days, topics push into intensive phase (not ideal, but handles overflow).

        let topicIndex = 0;

        for (let i = 0; i < foundationDays; i++) {
            const currentDate = addDays(today, i);

            // Sunday = Rest/Light Revision?
            if (currentDate.getDay() === 0) {
                addItem(currentDate, {
                    type: "revision",
                    title: "Weekly Revision",
                    subtitle: "Review weak areas from the week",
                    priority: "Medium"
                });
                continue;
            }

            if (topicIndex < sortedTopics.length) {
                const topic = sortedTopics[topicIndex];
                addItem(currentDate, {
                    type: "topic",
                    title: topic.name,
                    subtitle: `${sections.find(s => s.id === topic.section_id)?.name} • ${topic.priority} Priority`,
                    topicId: topic.id,
                    priority: topic.priority
                });
                topicIndex++;
            } else {
                // Ran out of topics? Revision.
                addItem(currentDate, {
                    type: "revision",
                    title: "General Revision",
                    subtitle: "Practice mixed sets",
                    priority: "Low"
                });
            }
        }

        // --- Phase 2: Intensive (20 days before Attempt 1) ---
        // Alternating Mock | Analysis
        const intensiveStartDate = addDays(today, foundationDays);

        for (let i = 0; i < intensivePhaseStart; i++) {
            const currentDate = addDays(intensiveStartDate, i);
            // Prevent scheduling past exam
            if (isBefore(attempt1Date, currentDate)) break;

            // Alternate Mock vs Analysis
            // Even days (0, 2, 4...) = Mock? Or maybe Mock every 2-3 days.
            // Let's do Mock twice a week. 
            // Strategy: Every 3rd day is Mock.
            // Or simpler pattern: Mock, Analysis, Revision, Mock, Analysis, Revision.

            const cycleDay = i % 3;
            if (cycleDay === 0) {
                addItem(currentDate, {
                    type: "mock",
                    title: "Full Length Mock Test",
                    subtitle: "Simulate exam conditions (150 mins)",
                    topicId: "mock-2025-1", // We should rotate mock IDs if possible
                    priority: "High"
                });
            } else if (cycleDay === 1) {
                addItem(currentDate, {
                    type: "revision",
                    title: "Mock Analysis",
                    subtitle: "Deep dive into errors and weak areas",
                    priority: "High"
                });
            } else {
                addItem(currentDate, {
                    type: "topic",
                    title: "Targeted Practice",
                    subtitle: "Focus on lowest scoring section",
                    priority: "Medium"
                });
            }
        }

        // Mark Exam Day 1
        addItem(attempt1Date, {
            type: "revision", // Special type "exam"?
            title: "MBA CET Attempt 1",
            subtitle: "Good Luck! You are ready.",
            priority: "High"
        });


        // --- Phase 3: Refinement (Between Exam 1 and 2) ---
        // April 7 to May 8
        const daysBetween = differenceInDays(attempt2Date, attempt1Date) - 1;
        const phase3Start = addDays(attempt1Date, 1);

        for (let i = 0; i < daysBetween; i++) {
            const currentDate = addDays(phase3Start, i);

            // 2 Mocks per week
            const dayOfWeek = currentDate.getDay(); // 0 is Sunday
            if (dayOfWeek === 6 || dayOfWeek === 3) { // Wed and Sat
                addItem(currentDate, {
                    type: "mock",
                    title: "Advanced Mock Test",
                    subtitle: "Push for higher percentiles",
                    topicId: "mock-2025-2",
                    priority: "High"
                });
            } else if (dayOfWeek === 0) {
                addItem(currentDate, {
                    type: "rest",
                    title: "Rest & Recovery",
                    subtitle: "Light reading only",
                    priority: "Low"
                });
            } else {
                addItem(currentDate, {
                    type: "topic",
                    title: "Sectional Mastery",
                    subtitle: "Advanced difficulty sets",
                    priority: "Medium"
                });
            }
        }

        // Mark Exam Day 2
        addItem(attempt2Date, {
            type: "revision",
            title: "MBA CET Attempt 2",
            subtitle: "Final Shot at Glory",
            priority: "High"
        });

        return generatedPlan;
    }, [topics, sections, today, attempt1Date, attempt2Date]);

    return plan;
}
