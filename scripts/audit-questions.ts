
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'src/data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');

const questions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf-8'));

const counts: Record<string, number> = {};
const inactive: Record<string, number> = {};

questions.forEach((q: any) => {
    if (q.is_active) {
        counts[q.topic_id] = (counts[q.topic_id] || 0) + 1;
    } else {
        inactive[q.topic_id] = (inactive[q.topic_id] || 0) + 1;
    }
});

console.log("--- Active Question Counts ---");
Object.entries(counts).sort((a,b) => b[1] - a[1]).forEach(([tid, count]) => {
    console.log(`${tid}: ${count}`);
});

console.log("\n--- Inactive Question Counts ---");
Object.entries(inactive).sort((a,b) => b[1] - a[1]).forEach(([tid, count]) => {
    console.log(`${tid}: ${count}`);
});

console.log(`\nTotal Questions: ${questions.length}`);
