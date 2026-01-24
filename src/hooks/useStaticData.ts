import { useMemo } from "react";
import sectionsData from "@/data/sections.json";
import topicsData from "@/data/topics.json";
import questionsData from "@/data/questions.json";
import strategiesData from "@/data/strategies.json";
import { Section, Topic, Question, Strategy } from "@/types";
import { generateSyllogism, generateBloodRelations, generateCodingDecoding } from "@/utils/generators/lr";
import { generateTimeWork, generatePercentage, generateProfitLoss } from "@/utils/generators/qa";
import { generateVocab, generateGrammar, generateParaJumbles } from "@/utils/generators/varc";

export function useStaticData() {
  const sections = useMemo(() => sectionsData as Section[], []);
  const topics = useMemo(() => topicsData as Topic[], []);
  const strategies = useMemo(() => strategiesData as Strategy[], []);
  
  // Merge Static + Generated Questions
  const questions = useMemo(() => {
     const staticQ = questionsData as Question[];
     
     // Generate additional questions
     try {
        const genSyll = generateSyllogism(100, 1000);
        const genBlood = generateBloodRelations(100, 2000);
        const genTW = generateTimeWork(100, 3000); // 171 items implies 1 static + 170 gen. Readjust to 100 if user wants "100 more". I'll set to 150.
        const genPct = generatePercentage(100, 4000);
        const genVocab = generateVocab(100, 5000);
        const genGram = generateGrammar(100, 6000);
        
        // New Phase 2 Topics
        const genPL = generateProfitLoss(100, 7000);
        const genPJ = generateParaJumbles(100, 8000);
        const genCD = generateCodingDecoding(100, 9000);
        
        const rawQuestions = [
            ...staticQ,
            ...genSyll,
            ...genBlood,
            ...genTW,
            ...genPct,
            ...genVocab,
            ...genGram,
            ...genPL,
            ...genPJ,
            ...genCD
        ];
        
        // Deduplication Logic
        const uniqueQuestions: Question[] = [];
        const seenIds = new Set<string>();
        const seenTexts = new Set<string>();
        
        for (const q of rawQuestions) {
            // Normalize text for comparison (remove whitespace, case insensitive)
            const normalizedText = q.question_text.toLowerCase().replace(/\s+/g, '').slice(0, 100); // Check first 100 chars sufficient
            
            if (seenIds.has(q.id)) {
                continue;
            }
            if (seenTexts.has(normalizedText)) {
                // Potential content duplicate, skip generic ones
                // console.warn("Duplicate question text found:", q.id);
                continue;
            }
            
            seenIds.add(q.id);
            seenTexts.add(normalizedText);
            uniqueQuestions.push(q);
        }
        
        return uniqueQuestions;
     } catch (e) {
         console.error("Failed to generate expanded questions:", e);
         return staticQ;
     }
  }, []);

  const getTopicsBySection = (sectionId: string): Topic[] => {
    return topics
      .filter((t) => t.section_id === sectionId && t.is_active)
      .sort((a, b) => a.order - b.order);
  };

  const getTopicById = (topicId: string): Topic | undefined => {
    return topics.find((t) => t.id === topicId);
  };

  const getSectionById = (sectionId: string): Section | undefined => {
    return sections.find((s) => s.id === sectionId);
  };

  // Helper for seeded shuffle
  const seededShuffle = (array: Question[], seed: string) => {
      // Simple hash of string to number
      let h = 0xdeadbeef;
      for(let i = 0; i < seed.length; i++) {
          h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
      }
      const val = ((h ^ h >>> 16) >>> 0);
      
      const shuffled = [...array];
      let m = shuffled.length, t, i;
      
      // Fisher-Yates with seed
      // Using a linear congruential generator for pseudo-randomness
      let state = val;
      const nextRandom = () => {
          state = (state * 1664525 + 1013904223) % 4294967296;
          return state / 4294967296;
      }

      while (m) {
        i = Math.floor(nextRandom() * m--);
        t = shuffled[m];
        shuffled[m] = shuffled[i];
        shuffled[i] = t;
      }
      return shuffled;
  };

  const getQuestionsByTopic = (topicId: string): Question[] => {
    // Special handling for Mock Tests if they don't have explicit questions in JSON
    if (topicId.startsWith("mock-")) {
        // Check if we have explicit questions
        const explicitQuestions = questions.filter(q => q.topic_id === topicId && q.is_active);
        if (explicitQuestions.length > 0) return explicitQuestions;
        
        // If no explicit questions, generate a "Full Length Mock" from existing pool
        const lr = questions.filter(q => q.section_id === "LR" && q.is_active);
        const ar = questions.filter(q => q.section_id === "AR" && q.is_active);
        const qa = questions.filter(q => q.section_id === "QA" && q.is_active);
        const varc = questions.filter(q => q.section_id === "VARC" && q.is_active);
        
        // Shuffle POOLS first based on seed so we pick different questions
        // Or pick all then shuffle?
        // Better to shuffle the source pools then slice, so different mocks get DIFFERENT subsets if available.
        const shuffledLR = seededShuffle(lr, topicId + "LR").slice(0, 75);
        const shuffledAR = seededShuffle(ar, topicId + "AR").slice(0, 25);
        const shuffledQA = seededShuffle(qa, topicId + "QA").slice(0, 50);
        const shuffledVARC = seededShuffle(varc, topicId + "VARC").slice(0, 50);
        
        // Combine sections in standard order
        const combined = [...shuffledLR, ...shuffledAR, ...shuffledQA, ...shuffledVARC];
        return combined;
    }
    return questions.filter((q) => q.topic_id === topicId && q.is_active);
  };

  const getQuestionsBySection = (sectionId: string): Question[] => {
    return questions.filter((q) => q.section_id === sectionId && q.is_active);
  };

  const getStrategiesBySection = (sectionId: string | null): Strategy[] => {
    if (sectionId === null) {
      return strategies.filter((s) => s.section_id === null);
    }
    return strategies.filter((s) => s.section_id === sectionId);
  };

  const getAllTopicIds = (): string[] => {
    return topics.filter((t) => t.is_active).map((t) => t.id);
  };

  const getHighPriorityIncompleteTopic = (
    completedTopicIds: Set<string>
  ): Topic | undefined => {
    // Priority order: High > Medium > Low
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };

    const incompletTopics = topics
      .filter((t) => t.is_active && !completedTopicIds.has(t.id))
      .sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        // Within same priority, sort by section order then topic order
        const sectionA = sections.find((s) => s.id === a.section_id)?.order ?? 0;
        const sectionB = sections.find((s) => s.id === b.section_id)?.order ?? 0;
        if (sectionA !== sectionB) return sectionA - sectionB;
        return a.order - b.order;
      });

    return incompletTopics[0];
  };

  return {
    sections: sections.sort((a, b) => a.order - b.order),
    topics,
    questions,
    strategies,
    getTopicsBySection,
    getTopicById,
    getSectionById,
    getQuestionsByTopic,
    getQuestionsBySection,
    getStrategiesBySection,
    getAllTopicIds,
    getHighPriorityIncompleteTopic,
  };
}
