
import fs from 'fs';
import path from 'path';

// Define the mappings from ID keywords to Topic IDs
const KEYWORD_MAPPINGS: Record<string, string> = {
    // LR
    'syllogism': 'lr-syllogism',
    'blood-relation': 'lr-blood-relations',
    'coding': 'lr-coding-decoding',
    'direction': 'lr-direction-sense',
    'seating': 'lr-seating-arrangement',
    'puzzle': 'lr-puzzles',
    'sufficiency': 'lr-data-sufficiency', // careful with overlap
    'sequence': 'lr-logical-sequence',
    'statement': 'lr-statement-conclusion',
    'input-output': 'lr-input-output',
    
    // AR
    'series': 'ar-series',
    'analogy': 'ar-analogy',
    'classification': 'ar-classification',
    'pattern': 'ar-pattern-completion',
    'mirror': 'ar-mirror-water-image', // partial match
    
    // QA
    'number-system': 'qa-number-system',
    'percentage': 'qa-percentage',
    'profit': 'qa-profit-loss',
    'ratio': 'qa-ratio-proportion',
    'work': 'qa-time-work',
    'speed': 'qa-time-speed-distance',
    'interest': 'qa-simple-compound-interest',
    'average': 'qa-averages',
    'algebra': 'qa-algebra',
    'geometry': 'qa-geometry',
    'interpretation': 'qa-data-interpretation',

    // VARC
    'comprehension': 'varc-reading-comprehension', // careful
    'jumble': 'varc-para-jumbles',
    'completion': 'varc-sentence-completion',
    'grammar': 'varc-grammar',
    'vocabulary': 'varc-vocabulary',
    'reasoning': 'varc-verbal-reasoning', // might overlap
    'critical': 'varc-critical-reasoning'
};

try {
    const DATA_DIR = path.resolve(process.cwd(), 'src/data');
    const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
    const TOPICS_FILE = path.join(DATA_DIR, 'topics.json');

    console.log(`Reading from: ${QUESTIONS_FILE}`);
    if (!fs.existsSync(QUESTIONS_FILE)) throw new Error(`File not found: ${QUESTIONS_FILE}`);
    if (!fs.existsSync(TOPICS_FILE)) throw new Error(`File not found: ${TOPICS_FILE}`);

    const questions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf-8'));
    const topics = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf-8'));

    // Get list of active target topics per section
    const getTargetTopics = (sectionId: string) => {
        return topics
            .filter((t: any) => t.section_id === sectionId && t.is_active && !t.id.endsWith('-pyq') && !t.id.startsWith('mock-'))
            .map((t: any) => t.id);
    };

    const lrTopics = getTargetTopics('LR');
    const arTopics = getTargetTopics('AR');
    const qaTopics = getTargetTopics('QA');
    const varcTopics = getTargetTopics('VARC');

    console.log(`Found ${questions.length} total questions.`);
    console.log(`Topics available - LR: ${lrTopics.length}, AR: ${arTopics.length}, QA: ${qaTopics.length}, VARC: ${varcTopics.length}`);

    let updatedCount = 0;
    let lrIndex = 0;
    let arIndex = 0;
    let qaIndex = 0;
    let varcIndex = 0;

    const updatedQuestions = questions.map((q: any) => {
        // Only attempt to reclassify if it's currently in a generic "pyq" bucket
        // We look for strict match or startsWith to catch variations if any, but usually it's exact.
        if (q.topic_id === 'lr-pyq' && lrTopics.length > 0) {
            // Distribute round-robin
            q.topic_id = lrTopics[lrIndex % lrTopics.length];
            lrIndex++;
            updatedCount++;
        } else if (q.topic_id === 'ar-pyq' && arTopics.length > 0) {
            q.topic_id = arTopics[arIndex % arTopics.length];
            arIndex++;
            updatedCount++;
        } else if (q.topic_id === 'qa-pyq' && qaTopics.length > 0) {
             q.topic_id = qaTopics[qaIndex % qaTopics.length];
             qaIndex++;
             updatedCount++;
        } else if (q.topic_id === 'varc-pyq' && varcTopics.length > 0) {
             q.topic_id = varcTopics[varcIndex % varcTopics.length];
             varcIndex++;
             updatedCount++;
        }
        
        return q;
    });

    if (updatedCount > 0) {
        console.log(`Updated ${updatedCount} questions.`);
        fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(updatedQuestions, null, 2));
        console.log("File saved successfully.");
    } else {
        console.log("No questions needed reclassifying (no questions found in pyq buckets with available targets).");
    }

} catch (error) {
    console.error("Fatal error in reclassify script:", error);
    process.exit(1);
}
