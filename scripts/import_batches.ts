
import fs from 'fs';
import path from 'path';

// Types (simplified version of src/types/index.ts for the script)
interface Question {
    id: string;
    topic_id: string;
    section_id: string;
    question_text: string | null;
    question_image?: string | null;
    instruction_text?: string;
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

const DATA_DIR = path.resolve(process.cwd(), 'src/data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const BATCHES_DIR = path.resolve(process.cwd(), 'question_batches');

const TOPIC_MAPPING: Record<string, string> = {
    "Seating_and_Puzzles": "lr-puzzles",
    "Coding_Decoding": "lr-coding-decoding",
    "Syllogisms": "lr-syllogism",
    "Series": "ar-series",
    "Blood_Relations": "lr-blood-relations",
    "Critical_Reasoning": "varc-critical-reasoning",
    "Arithmetic": "qa-pyq",
    "Algebra": "qa-algebra",
    "Geometry_and_Mensuration": "qa-geometry",
    "Data_Interpretation_text_only": "qa-data-interpretation",
    "Probability_and_Sets": "qa-pyq",
    "Vocabulary": "varc-vocabulary",
    "Grammar": "varc-grammar",
    "Para_Jumbles": "varc-para-jumbles"
};

const SECTION_OVERRIDES: Record<string, string> = {
    "varc-critical-reasoning": "VARC"
};

const DIFFICULTY_MAPPING: Record<string, "Easy" | "Medium" | "Hard"> = {
    "Moderate": "Medium",
    "Easy": "Easy",
    "Hard": "Hard"
};

function main() {
    console.log("Starting import...");

    // 1. Read existing questions
    let existingQuestions: Question[] = [];
    if (fs.existsSync(QUESTIONS_FILE)) {
        existingQuestions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf-8'));
        console.log(`Loaded ${existingQuestions.length} existing questions.`);
    }

    const existingIds = new Set(existingQuestions.map(q => q.id));

    // 2. Read batch files
    if (!fs.existsSync(BATCHES_DIR)) {
        console.error(`Batches directory not found: ${BATCHES_DIR}`);
        return;
    }

    const startCount = existingQuestions.length;
    let addedCount = 0;

    const files = fs.readdirSync(BATCHES_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
        console.log(`Processing batch: ${file}`);
        const filePath = path.join(BATCHES_DIR, file);
        try {
            const batchQuestions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            for (const rawQ of batchQuestions) {
                // Determine new ID (if conflict, generate new one)
                let newId = rawQ.id;
                if (existingIds.has(newId)) {
                    // console.warn(`Duplicate ID found: ${newId}. Skipping... (or handle duplicate logic)`);
                    // For now, let's assume we want to skip duplicates to avoid double importing
                    continue;
                }

                // Map Topic
                const mappedTopic = TOPIC_MAPPING[rawQ.topic_id] || rawQ.topic_id;

                // Map Section (Override if needed)
                let sectionId = rawQ.section_id;
                if (SECTION_OVERRIDES[mappedTopic]) {
                    sectionId = SECTION_OVERRIDES[mappedTopic];
                }

                // Map Difficulty
                let difficulty = rawQ.difficulty;
                if (DIFFICULTY_MAPPING[rawQ.difficulty]) {
                    difficulty = DIFFICULTY_MAPPING[rawQ.difficulty];
                }

                const newQuestion: Question = {
                    ...rawQ,
                    id: newId,
                    topic_id: mappedTopic,
                    section_id: sectionId,
                    difficulty: difficulty,
                    // Ensure required fields exist
                    explanation: rawQ.explanation || null,
                    option_e: rawQ.option_e || null,
                    correct_option: rawQ.correct_option as "A" | "B" | "C" | "D" | "E"
                };

                existingQuestions.push(newQuestion);
                existingIds.add(newId);
                addedCount++;
            }

        } catch (error) {
            console.error(`Error processing file ${file}:`, error);
        }
    }

    // 3. Write back to file
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(existingQuestions, null, 2));
    console.log(`Import complete.`);
    console.log(`Initial count: ${startCount}`);
    console.log(`Added: ${addedCount}`);
    console.log(`Final count: ${existingQuestions.length}`);
}

main();
