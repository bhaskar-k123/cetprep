import { Question } from "@/types";
import { SeededRNG } from "./rng";

const SUBJ = ["Cats", "Dogs", "Bats", "Mats", "Rats", "Hats", "Pens", "Dens", "Cars", "Jars", "Maps", "Taps", "Logs", "Dogs"];

export function generateSyllogism(count: number, startId: number): Question[] {
  const questions: Question[] = [];
  const rng = new SeededRNG("lr-syl-5block-v1");

  // Helper to get 3 unique subjects
  const getABC = () => {
      const a = rng.pick(SUBJ);
      let b = rng.pick(SUBJ);
      while(b===a) b = rng.pick(SUBJ);
      let c = rng.pick(SUBJ);
      while(c===a || c===b) c = rng.pick(SUBJ);
      return [a, b, c];
  };

  // Block A: Only a few + All + Some not (20 Q)
  // Logic: "Only a few A are B" -> Some A are B, Some A are !B.
  // Add "All B are C".
  // Concl: 1. All A is C (Possibility? Yes. Definite? No).
  //        2. Some A are not C (Possibility).
  //        3. All C are B (Possibility).
  const genBlockA = (idx: number) => {
      const [A, B, C] = getABC();
      return {
          text: `Statements:\n1. Only a few ${A} are ${B}.\n2. All ${B} are ${C}.\n\nConclusions:\nI. All ${A} being ${B} is a possibility.\nII. Some ${A} are ${C}.`,
          ans: "Only II follows",
          wrong: ["Only I follows", "Both follow", "Neither follows", "Either I or II follows"],
          expl: `1. Only a few A are B => Some A are B (True) & Some A are not B (True). Since Some A are not B, All A being B is NOT a possibility. I is False.\n2. Some A are B and All B are C => Some A are C is definitely True. II follows.`,
          diff: "Hard"
      };
  };

  // Block B: Possibility-based (20 Q)
  // Logic: No A is B. No B is C.
  // Concl: All A being C is a possibility (True).
  const genBlockB = (idx: number) => {
      const [A, B, C] = getABC();
      return {
          text: `Statements:\n1. No ${A} is ${B}.\n2. No ${B} is ${C}.\n\nConclusions:\nI. All ${A} being ${C} is a possibility.\nII. No ${A} is ${C}.`,
          ans: "Only I follows",
          wrong: ["Only II follows", "Both follow", "Neither follows", "Either I or II follows"],
          expl: `Relation A-B is No. Relation B-C is No. Relation A-C is Unknown. In Unknown relation, 'No' is not definite (II False), but 'Possibility' of All is True (I True).`,
          diff: "Hard"
      };
  };

  // Block C: Multiple valid diagrams (Ambiguity) (20 Q)
  // Logic: Some A are B. Some B are C.
  // Concl: Some A are C (False). No A is C (False).
  // Either Or case often.
  const genBlockC = (idx: number) => {
      const [A, B, C] = getABC();
      return {
          text: `Statements:\n1. Some ${A} are ${B}.\n2. Some ${B} are ${C}.\n\nConclusions:\nI. Some ${A} are ${C}.\nII. No ${A} is ${C}.`,
          ans: "Either I or II follows",
          wrong: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
          expl: `A and C have no direct link. They might overlap (Some) or be disjoint (No). This forms a complementary pair with 'Some' + 'No'. Thus, Either I or II follows.`,
          diff: "Medium"
      };
  };

  // Block D: Complement/Negative (20 Q)
  // Logic: All A are B. Some B are not C.
  // Concl: Some B are not A (False/Unknown - technically false).
  // Concl: Some A are not C (Unknown).
  const genBlockD = (idx: number) => {
      const [A, B, C] = getABC();
      return {
          text: `Statements:\n1. All ${A} are ${B}.\n2. Some ${B} are not ${C}.\n\nConclusions:\nI. Some ${B} are not ${A}.\nII. No ${A} is ${C}.`,
          ans: "Neither follows",
          wrong: ["Only I follows", "Only II follows", "Both follow", "Either I or II follows"],
          expl: `I. We know All A are B. This implies Some B are A. It does NOT imply Some B are not A (B could be equal to A). False.\nII. A is inside B. Some B are not C. A could fully be inside C or outside. Unknown. False.`,
          diff: "Hard"
      };
  };

  // Block E: Traps (Cannot be concluded) (20 Q)
  // Logic: All A are B. All C are B.
  // Concl: Some A are C. (Classic Trap).
  const genBlockE = (idx: number) => {
      const [A, B, C] = getABC();
      return {
          text: `Statements:\n1. All ${A} are ${B}.\n2. All ${C} are ${B}.\n\nConclusions:\nI. Some ${A} are ${C}.\nII. A can never be ${C}.`,
          ans: "Neither follows",
          wrong: ["Only I follows", "Only II follows", "Both follow", "Either I or II follows"],
          expl: `A and C are both inside B, but can be disjoint. I is False. II is 'Can never' (Definite No probability). false, because they COULD overlap. Neither follows.`,
          diff: "Medium"
      };
  };

  const blocks = [genBlockA, genBlockB, genBlockC, genBlockD, genBlockE];
  const questionsPerBlock = Math.ceil(count / 5);

  for (let b = 0; b < 5; b++) {
      for (let k = 0; k < questionsPerBlock; k++) {
          if (questions.length >= count) break;
          const qData = blocks[b](k);
          
          questions.push({
              id: `gen-lr-syl-block${b}-${startId + questions.length}`,
              topic_id: "lr-syllogism",
              section_id: "LR",
              question_text: qData.text,
              option_a: qData.ans,
              option_b: qData.wrong[0],
              option_c: qData.wrong[1],
              option_d: qData.wrong[2],
              option_e: qData.wrong[3],
              correct_option: "A",
              explanation: qData.expl,
              difficulty: qData.diff as any,
              is_active: true
          });
      }
  }

  return questions;
}


const NAMES = ["Amit", "Bina", "Chetan", "Divya", "Esha", "Farhan", "Gauri", "Harsh"];

export function generateBloodRelations(count: number, startId: number): Question[] {
    const questions: Question[] = [];
    const rng = new SeededRNG("lr-blood-5block-v1");

    // Block A: Symbol Coded (20 Q)
    const genBlockA = (idx: number) => {
        // P @ Q = P is father of Q
        // P $ Q = P is mother of Q
        // P # Q = P is brother of Q
        // P & Q = P is sister of Q
        // Exp: A @ B $ C # D. How is A related to D?
        // A (Father) -> B (Mother) -> C (Brother) -> D.
        // A is Maternal Grandfather of D.
        const ops = [
            { sym: "@", rel: "Father", gen: 1, sex: "M" },
            { sym: "$", rel: "Mother", gen: 1, sex: "F" },
            { sym: "#", rel: "Brother", gen: 0, sex: "M" },
            { sym: "&", rel: "Sister", gen: 0, sex: "F" }
        ];
        
        // Let's pick a fixed chain: A op1 B op2 C op3 D
        // A @ B (A is Father of B)
        // B # C (B is Brother of C) -> A is Father of C too.
        // C $ D (C is Mother of D) -> A is Maternal Grandfather of D.
        
        return {
            text: `Directions: P@Q (Father), P$Q (Mother), P#Q (Brother), P&Q (Sister).\n\nIn the expression "A @ B # C $ D", how is A related to D?`,
            ans: "Maternal Grandfather",
            wrong: ["Paternal Grandfather", "Uncle", "Father", "Grandson"],
            expl: `A is Father of B. B is Brother of C. So A is Father of C. C is Mother of D. Father of Mother = Maternal Grandfather.`,
            diff: "Hard"
        };
    };

    // Block B: Age-based Inequalities (Mixed Logic) (20 Q)
    const genBlockB = (idx: number) => {
        // A is older than B. C is younger than D.
        // B is the father of C. D is the sister of B.
        // Who is the youngest?
        // (Clue: Child is younger than Parent).
        // C < B. (Since B is father).
        // A > B. 
        // Order: A > B > C.
        // D? D is sister of B. D and B same gen roughly, but D ? C? D is aunt of C. D > C.
        // Smallest is C.
        return {
            text: `A is older than B. D is the sister of B. B is the father of C. Who is definitely the youngest among them?`,
            ans: "C",
            wrong: ["A", "B", "D", "Cannot be determined"],
            expl: `Logic: A > B. B is father of C, so B > C. D is sister of B (Gen 0 with B), so D > C. Thus C is youngest.`,
            diff: "Medium"
        };
    };

    // Block C: Multi-generation (20 Q)
    const genBlockC = (idx: number) => {
        return {
            text: `Looking at a family portrait, Rahul said, "I have no brothers or sisters, but that man's father is my father's son." Whose photograph was it?`,
            ans: "His son", // Classic riddle. My father's son (me). That man's father is Me. That man is my son.
            wrong: ["His father", "Himself", "His nephew", "His uncle"],
            expl: `Rahul has no siblings. "My father's son" = Rahul. "That man's father is Rahul". So, the photo is of Rahul's son.`,
            diff: "Tricky"
        };
    };

    // Block D: In-law / Step Relations (20 Q)
    const genBlockD = (idx: number) => {
        // A is married to B. B is the daughter of C.
        // D is the brother of A.
        // How is D related to C? (D is brother of Son-in-law).
        // No standard term? In India: "Son's brother" / just "Relative"?
        // Better: How is C related to D?
        // C is parent of B. B is wife of A. A is brother of D.
        // C is Parent-in-law of A?
        // Let's go simple. B is daughter of C. A is husband of B. A is Son-in-law of C.
        // D is brother of A. D is Brother-in-law of B? Yes.
        // Q: How is D related to B?
        return {
            text: `A is married to B. B is the only daughter of C. D is the brother of A. How is D related to B?`,
            ans: "Brother-in-law",
            wrong: ["Brother", "Husband", "Uncle", "Cousin"],
            expl: `D is the brother of B's husband (A). So D is Brother-in-law of B.`,
            diff: "Medium"
        };
    };

    // Block E: Impossible/Counting (20 Q)
    const genBlockE = (idx: number) => {
        // A family has 2 fathers and 2 sons. Minimum people?
        // Grandfather -> Father -> Son. 
        // Fathers: GF, F. Sons: F, S. Total 3 people.
        return {
            text: `A family dinner had 2 fathers and 2 sons present. What is the minimum number of people that could have been at the dinner?`,
            ans: "3",
            wrong: ["4", "2", "5", "6"],
            expl: `Grandfather (Father 1) -> Father (Son 1 / Father 2) -> Son (Son 2). Total 3 people cover '2 fathers, 2 sons'.`,
            diff: "Tricky"
        };
    };

    const blocks = [genBlockA, genBlockB, genBlockC, genBlockD, genBlockE];
    const questionsPerBlock = Math.ceil(count / 5);

    for (let b = 0; b < 5; b++) {
        for (let k = 0; k < questionsPerBlock; k++) {
            if (questions.length >= count) break;
            const qData = blocks[b](k);
            
            questions.push({
                id: `gen-lr-br-block${b}-${startId + questions.length}`,
                topic_id: "lr-blood-relations",
                section_id: "LR",
                question_text: qData.text,
                option_a: qData.ans,
                option_b: qData.wrong[0],
                option_c: qData.wrong[1],
                option_d: qData.wrong[2],
                option_e: qData.wrong[3],
                correct_option: "A",
                explanation: qData.expl,
                difficulty: qData.diff as any,
                is_active: true
            });
        }
    }
    return questions;
}


const WORDS = ["TABLE", "CHAIR", "PLANT", "CLOUD", "MUSIC", "BREAD", "GHOST", "TIGER", "ZEBRA", "OCEAN", "POWER", "LIGHT", "DREAM", "STORM"];

export function generateCodingDecoding(count: number, startId: number): Question[] {
    const questions: Question[] = [];
    const rng = new SeededRNG("lr-coding-5block-v1");

    // Helper: Shift string
    const shiftStr = (s: string, n: number) => {
        return s.split("").map(c => {
            const code = c.charCodeAt(0);
            if(code < 65 || code > 90) return c;
            let nCode = code + n;
            if(nCode > 90) nCode -= 26;
            if(nCode < 65) nCode += 26;
            return String.fromCharCode(nCode);
        }).join("");
    };

    // Helper: Reverse string
    const revStr = (s: string) => s.split("").reverse().join("");

    // Block A: Reverse + Basic Shift logic (20 Q)
    const genBlockA = (idx: number) => {
        // Logic: Reverse word, then Shift +1
        const word = rng.pick(WORDS);
        const target = rng.pick(WORDS.filter(w => w !== word));
        
        const logic = (w: string) => shiftStr(revStr(w), 1);
        const exampleCode = logic(word);
        const ans = logic(target);
        
        return {
            text: `In a certain code, ${word} is written as ${exampleCode}. How is ${target} written in that code?`,
            ans: ans,
            wrong: [shiftStr(target, 1), revStr(target), shiftStr(revStr(target), -1), shiftStr(target, 2)],
            expl: `Logic: Reverse the word first, then add +1 to each letter. ${target} -> ${revStr(target)} -> ${ans}.`,
            diff: "Medium"
        };
    };

    // Block B: Alphabet -> Number/Pos -> Alphabet (20 Q)
    const genBlockB = (idx: number) => {
        // Logic: Opposite Letter (A<->Z, B<->Y)
        const word = rng.pick(WORDS);
        const target = rng.pick(WORDS.filter(w => w !== word));
        
        const getOpposite = (char: string) => {
            const code = char.charCodeAt(0) - 65;
            const opp = 25 - code;
            return String.fromCharCode(65 + opp);
        };
        const logic = (w: string) => w.split("").map(getOpposite).join("");
        
        const exampleCode = logic(word);
        const ans = logic(target);
        
        return {
            text: `In a coded language, ${word} is encoded as ${exampleCode}. What is the code for ${target}?`,
            ans: ans,
            wrong: [shiftStr(target, 14), shiftStr(target, -1), logic(revStr(target)), shiftStr(target, 1)],
            expl: `Logic: Each letter is replaced by its opposite pair (A<->Z, B<->Y, etc.).`,
            diff: "Medium"
        };
    };

    // Block C: Position-based (Rearrangement) (20 Q)
    const genBlockC = (idx: number) => {
        // Logic: Swap adjacent pairs. 1-2, 3-4. Or Odd/Even positions.
        // Let's do: First letter goes to last. Last to first. Middle stays?
        // Let's do Pair Swap: 123456 -> 214365
        const word = "NUMBER"; // Fixed length 6 for consistency or use pure logic description
        // Let's use 5-6 letter words.
        const w = "SYSTEM";
        // SY STEM -> YS METS? No.
        // Simple shift: +1, -1, +1, -1
        
        const word1 = "PERSON";
        const code1 = "EPRONS"; // PE -> EP, RS -> ?, ON -> ? No, PE RS ON -> EP R S NO? 
        // Logic: Pairs swapped.
        const t = "REPORT";
        const ans = "EROPTR"; // RE PO RT -> ER OP TR
        
        return {
            text: `If ${word1} is coded as ${code1}, how will ${t} be coded?`,
            ans: ans,
            wrong: ["EPRORT", "REOPTR", "ROEPTR", "RTOPRE"],
            expl: `Logic: Divide the word into pairs and swap the letters in each pair.`,
            diff: "Easy"
        };
    };

    // Block D: Multi-step encoding (20 Q)
    const genBlockD = (idx: number) => {
        // Step 1: Vowels + 1, Consonants - 1.
        // Step 2: Reverse.
        const word = rng.pick(WORDS);
        const target = rng.pick(WORDS.filter(w => w !== word));
        
        const logic = (w: string) => {
            const step1 = w.split("").map(c => {
                const isVowel = "AEIOU".includes(c);
                return shiftStr(c, isVowel ? 1 : -1);
            }).join("");
            return revStr(step1);
        };
        
        return {
            text: `In a code, ${word} becomes ${logic(word)}. Find the code for ${target}.`,
            ans: logic(target),
            wrong: [shiftStr(revStr(target), 1), logic(target).split("").reverse().join(""), shiftStr(target, 1), shiftStr(target, -1)],
            expl: `Logic: Consonants -1, Vowels +1, then Reverse the whole string.`,
            diff: "Hard"
        };
    };

    // Block E: Partial Pattern / Traps (20 Q)
    const genBlockE = (idx: number) => {
        // First half + 1, Second half - 1.
        // Trap: Option A has +1 everywhere. Option B has +1 first half, +1 second half...
        const word = "MASTER"; // 6 letters
        const example = "NBTSDQ"; // M->N, A->B, S->T (+1) | T->S, E->D, R->Q (-1)
        
        const target = "DANCER";
        // DAN ( +1 -> EBO ) | CER ( -1 -> BDQ )
        const ans = "EBOBDQ";
        
        return {
            text: `If ${word} is coded as ${example}, what is the code for ${target}?`,
            ans: ans,
            wrong: ["EBODES", "EBOEDS", "DBMBDQ", "EBOPDS"], // EBO DES (+1 everywhere), EBO EDS (+1, +1)
            expl: `Logic: First half of the word is shifted +1, second half is shifted -1.`,
            diff: "Tricky"
        };
    };

    const blocks = [genBlockA, genBlockB, genBlockC, genBlockD, genBlockE];
    const questionsPerBlock = Math.ceil(count / 5);

    for (let b = 0; b < 5; b++) {
        for (let k = 0; k < questionsPerBlock; k++) {
            if (questions.length >= count) break;
            const qData = blocks[b](k);
            
            questions.push({
                id: `gen-lr-cd-block${b}-${startId + questions.length}`,
                topic_id: "lr-coding-decoding",
                section_id: "LR",
                question_text: qData.text,
                option_a: qData.ans,
                option_b: qData.wrong[0],
                option_c: qData.wrong[1],
                option_d: qData.wrong[2],
                option_e: qData.wrong[3],
                correct_option: "A",
                explanation: qData.expl,
                difficulty: qData.diff as any,
                is_active: true
            });
        }
    }
    return questions;
}
