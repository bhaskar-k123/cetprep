
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'src/data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');

const TOPIC_FIXES: Record<string, string> = {
    "Reading_Comprehension": "varc-reading-comprehension",
    "Sentence_Completion_and_Cloze": "varc-sentence-completion",
    // Add any others if found later
};

const SECTION_FIXES: Record<string, string> = {
    "varc-reading-comprehension": "VARC",
    "varc-sentence-completion": "VARC"
};

function main() {
    console.log("Starting topic fix...");

    if (!fs.existsSync(QUESTIONS_FILE)) {
        console.error("Questions file not found.");
        return;
    }

    const questions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf-8'));
    let fixedCount = 0;

    for (const q of questions) {
        if (TOPIC_FIXES[q.topic_id]) {
            console.log(`Fixing ${q.id}: ${q.topic_id} -> ${TOPIC_FIXES[q.topic_id]}`);
            q.topic_id = TOPIC_FIXES[q.topic_id];

            // Also ensure section is correct
            if (SECTION_FIXES[q.topic_id]) {
                q.section_id = SECTION_FIXES[q.topic_id];
            }

            fixedCount++;
        }
    }

    if (fixedCount > 0) {
        fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
        console.log(`Fixed ${fixedCount} questions.`);
    } else {
        console.log("No questions needed fixing.");
    }
}

main();
