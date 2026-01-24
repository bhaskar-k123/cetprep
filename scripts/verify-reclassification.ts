
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'src/data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');

const questions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf-8'));

const counts: Record<string, number> = {};
questions.forEach((q: any) => {
    counts[q.topic_id] = (counts[q.topic_id] || 0) + 1;
});

console.log("Topic ID | Count");
console.log("---------|------");
Object.entries(counts).sort((a,b) => b[1]-a[1]).forEach(([id, count]) => {
    console.log(`${id.padEnd(25)} | ${count}`);
});
console.log(`\nTotal: ${questions.length}`);
