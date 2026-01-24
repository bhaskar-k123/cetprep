import fs from 'fs';
import path from 'path';

// Types (mirrored from src/types to avoid complexity in script)
interface Section { id: string; name: string; }
interface Topic { id: string; section_id: string; name: string; }
interface Question { 
  id: string; 
  topic_id: string; 
  section_id: string;
  correct_option: string;
}

const DATA_DIR = path.resolve(__dirname, '../src/data');

const loadJSON = (filename: string) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filename}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const validate = () => {
    console.log("Starting Data Validation...");
    
    const sections: Section[] = loadJSON('sections.json');
    const topics: Topic[] = loadJSON('topics.json');
    const questions: Question[] = loadJSON('questions.json');

    const sectionIds = new Set(sections.map(s => s.id));
    const topicIds = new Set(topics.map(t => t.id));

    let errors = 0;

    // Validate Topics
    topics.forEach(topic => {
        if (!sectionIds.has(topic.section_id)) {
            console.error(`[Topic Error] Topic '${topic.id}' references invalid section '${topic.section_id}'`);
            errors++;
        }
    });

    // Validate Questions
    questions.forEach(q => {
        if (!topicIds.has(q.topic_id)) {
             console.error(`[Question Error] Question '${q.id}' references invalid topic '${q.topic_id}'`);
             errors++;
        }
        if (!sectionIds.has(q.section_id)) {
            console.error(`[Question Error] Question '${q.id}' references invalid section '${q.section_id}'`);
            errors++;
        }
        
        // Logical check: Does question's topic belong to question's section?
        // This is a loose check because duplicative section_id is allowed for performace, but must match.
        const parentTopic = topics.find(t => t.id === q.topic_id);
        if (parentTopic && parentTopic.section_id !== q.section_id) {
             console.error(`[Consistency Error] Question '${q.id}' is in section '${q.section_id}' but its topic '${q.topic_id}' belongs to '${parentTopic.section_id}'`);
             errors++;
        }

        if (!['A', 'B', 'C', 'D', 'E'].includes(q.correct_option)) {
            console.error(`[Data Error] Question '${q.id}' has invalid correct_option '${q.correct_option}'`);
            errors++;
        }
    });

    // Print counts regardless of errors
    const counts: Record<string, number> = {};
    questions.forEach(q => {
        counts[q.topic_id] = (counts[q.topic_id] || 0) + 1;
    });
    console.log("\n--- Question Counts per Topic ---");
    Object.entries(counts).sort((a,b) => b[1] - a[1]).forEach(([tid, count]) => {
        console.log(`${tid}: ${count}`);
    });

    if (errors === 0) {
        console.log("✅ Data validation passed! All relationships are consistent.");
        process.exit(0);
    } else {
        console.error(`❌ Validation failed with ${errors} errors.`);
        process.exit(1);
    }
};

validate();
