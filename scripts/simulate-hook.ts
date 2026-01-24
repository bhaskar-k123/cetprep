
import fs from 'fs';
import path from 'path';

// Mock generators (minimal logic to check counts and topic IDs)
const mockGen = (topicId: string, count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        id: `gen-${topicId}-${i}`,
        topic_id: topicId,
        question_text: `Generated question ${i} for ${topicId}`,
        is_active: true
    }));
};

const DATA_DIR = path.resolve(process.cwd(), 'src/data');
const questionsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'questions.json'), 'utf-8'));

// Replicate hook logic
const genSyll = mockGen('lr-syllogism', 150);
const genBlood = mockGen('lr-blood-relations', 150);
const genTW = mockGen('qa-time-work', 150);
const genPct = mockGen('qa-percentage', 150);
const genVocab = mockGen('varc-vocabulary', 150);
const genGram = mockGen('varc-grammar', 150);
const genPL = mockGen('qa-profit-loss', 100);
const genPJ = mockGen('varc-para-jumbles', 100);
const genCD = mockGen('lr-coding-decoding', 100);

const rawQuestions = [
    ...questionsData,
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

const uniqueQuestions: any[] = [];
const seenIds = new Set();
const seenTexts = new Set();

for (const q of rawQuestions) {
    if (seenIds.has(q.id)) continue;
    
    const isGenerated = q.id && q.id.startsWith("gen-");
    const textToNormalize = (q.question_text || "").trim();
    
    if (isGenerated && textToNormalize.length > 0) {
        const normalizedText = textToNormalize.toLowerCase().replace(/\s+/g, '').slice(0, 150);
        if (seenTexts.has(normalizedText)) continue;
        seenTexts.add(normalizedText);
    }
    
    seenIds.add(q.id);
    uniqueQuestions.push(q);
}

const counts: Record<string, number> = {};
uniqueQuestions.forEach(q => {
    counts[q.topic_id] = (counts[q.topic_id] || 0) + 1;
});

console.log("Topic ID | Total Count (Static + Generated)");
console.log("---------|-------------------------------");
Object.entries(counts).sort((a,b) => b[1] - a[1]).forEach(([id, count]) => {
    console.log(`${id.padEnd(25)} | ${count}`);
});

console.log(`\nFinal Unique Questions: ${uniqueQuestions.length}`);
console.log(`Static Input: ${questionsData.length}`);
console.log(`Generated Added: ${genSyll.length + genBlood.length + genTW.length + genPct.length + genVocab.length + genGram.length + genPL.length + genPJ.length + genCD.length}`);
