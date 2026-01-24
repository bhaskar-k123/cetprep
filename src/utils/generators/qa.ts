import { Question } from "@/types";
import { SeededRNG } from "./rng";

// Helper: GCD
const gcd = (a: number, b: number): number => !b ? a : gcd(b, a % b);
// Helper: LCM
const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

export function generateTimeWork(count: number, startId: number): Question[] {
  const questions: Question[] = [];
  const rng = new SeededRNG("qa-timework-v3");

  const templates = [
      // 1. Basic: A and B together
      (i: number) => {
          const a = rng.pick([10, 12, 15, 20, 30, 40]);
          const b = rng.pick([12, 15, 20, 30, 60]);
          const num = a * b;
          const den = a + b;
          const ans = (num / den).toFixed(2);
          return {
              text: `A can finish a task in ${a} days and B in ${b} days. If they work together, how many days will they take?`,
              ans: `${ans} days`,
              wrong: [`${(num/den + 2).toFixed(2)} days`, `${(num/den - 1).toFixed(2)} days`, `${((a+b)/2).toFixed(1)} days`],
              expl: `1/A + 1/B = 1/T. (${a}*${b})/(${a}+${b}) = ${ans}.`,
              diff: "Easy"
          };
      },
      // 2. Efficiency: A is X times as good as B
      (i: number) => {
          const ratio = rng.pick([2, 3, 4]); // A is 2x, 3x faster
          const bDays = rng.pick([20, 30, 40, 60]); 
          const aDays = bDays / ratio;
          // Together?
          const ans = (aDays * bDays) / (aDays + bDays);
          return {
              text: `A is ${ratio} times as efficient as B. If B takes ${bDays} days to complete a wall, how many days will they take together?`,
              ans: `${ans.toFixed(1)} days`,
              wrong: [`${aDays.toFixed(1)} days`, `${(ans*1.5).toFixed(1)} days`, `${(bDays/2).toFixed(1)} days`],
              expl: `Ratio A:B = ${ratio}:1. Efficiency Total = ${ratio+1}. Work = ${bDays}*1 = ${bDays} units. Time = ${bDays}/${ratio+1} = ${ans.toFixed(1)}.`,
              diff: "Medium"
          };
      },
      // 3. Leaving: A leaves X days before completion
      (i: number) => {
           const a = rng.pick([20, 25, 30]);
           const b = rng.pick([30, 40, 50]);
           const x = rng.nextInt(3, 6);
           // Logic: (T-x)/A + T/B = 1.
           // T(1/A + 1/B) = 1 + x/A.
           // T = (1+x/A) / ( (A+B)/AB ) = ( (A+x)/A ) * (AB / (A+B) )
           const T = ((a+x)/a) * ((a*b)/(a+b));
           return {
               text: `A can do a job in ${a} days, B in ${b} days. They start together but A leaves ${x} days before completion. Total time?`,
               ans: `${T.toFixed(1)} days`,
               wrong: [`${(T-x).toFixed(1)} days`, `${(T+2).toFixed(1)} days`, `${((a+b)/2).toFixed(1)} days`],
               expl: `Let total time be T. B works T days, A works T-${x}. Solve (T-${x})/${a} + T/${b} = 1.`,
               diff: "Hard"
           };
      },
      // 4. Wages: Money distributed by work done
      (i: number) => {
          const a = rng.pick([10, 15, 20]);
          const b = rng.pick([20, 30, 40]);
          const totalWage = rng.pick([3000, 4500, 6000, 9000]); // Ensure divisible
          // Ratio of work = Inverse of time = 1/a : 1/b = b : a
          // Share of A = (b / (a+b)) * Wage
          const shareA = (b / (a+b)) * totalWage;
          return {
              text: `A can do a work in ${a} days, B in ${b} days. They worked together and completed it, earning Rs. ${totalWage}. What is A's share?`,
              ans: `Rs. ${shareA.toFixed(0)}`,
              wrong: [`Rs. ${shareA - 500}`, `Rs. ${shareA + 200}`, `Rs. ${totalWage/2}`],
              expl: `Wages ratio = Efficiency ratio = 1/${a} : 1/${b} = ${b}:${a}. A's share = (${b}/${a+b}) * ${totalWage}.`,
              diff: "Medium"
          };
      },
      // 5. Pipes: A and B fill, C empties (Tank problem)
      (i: number) => {
          const a = rng.pick([10, 12, 15]);
          const b = rng.pick([12, 15, 20]);
          const c = rng.pick([30, 60]); // Slow leak
          // Net = 1/a + 1/b - 1/c
          const net = (1/a + 1/b) - 1/c;
          const time = 1/net;
          return {
              text: `Pipe A fills a cistern in ${a}h, Pipe B in ${b}h. Pipe C can empty the full cistern in ${c}h. If all three are opened, how long to fill?`,
              ans: `${time.toFixed(1)} hours`,
              wrong: [`${(time-1).toFixed(1)} hours`, `${(time+2).toFixed(1)} hours`, "Never fills"],
              expl: `Net rate = 1/${a} + 1/${b} - 1/${c}. Answer = 1 / Net Rate.`,
              diff: "Medium"
          };
      },
      // 6. Men and Women Equation
      (i: number) => {
          // 2 Men and 3 Women do in 10 days.
          // 3 Men and 2 Women do in 8 days.
          // Find 1 Man time?
          // Hard to randomly gen consistent integers. Use standard pre-calc logic.
          // Assume 1M = 20 days, 1W = 30 days work.
          const mRate = 1/20;
          const wRate = 1/30; // 3u vs 2u per day (Total 60u)
          
          // Case 1: 3M + 2W = 3(3) + 2(2) = 13u/day. Time = 60/13.
          // Let's generate nice integers. 
          // M=1 unit/day, W=0.5 unit/day.
          // Task = 20 units.
          // 4M + 6W = 4(1)+6(0.5) = 7u. Time 20/7.
          // Simple Check: "12 men or 24 women can do a work in 20 days."
          // => 1 M = 2 W.
          // In how many days can 6 men and 12 women do it?
          // 6M + 12W = 6M + 6M = 12M. Same time?? No.
          // 12M = 20 days. 6M+12W = 12M = 20 days.
          
          const m = rng.pick([10, 12, 16]);
          const w = m*2; // 1 man = 2 women
          const d = rng.pick([14, 21, 28]); // days for OR condition
          // "m Men or w Women can do in d days"
          // => Total Work = m*d Man-Days.
          // Q: x Men and y Women?
          const x = m/2; 
          const y = w/2;
          // x men + y women = x men + (y/2) men = (x + y/2) men.
          // original m men. new (x+y/2) men.
          // Time = (m / new_m) * d
          // Let's ensure integer math
          // 10 Men or 20 women in 14 days. 
          // 5 Men and 10 women? => 5M + 5M = 10M. -> 14 days.
          // Logic: (m*w*d) / (m*y + w*x)
          const ans = (m * w * d) / (m * y + w * x);
          
          return {
               text: `${m} men or ${w} women can complete a work in ${d} days. In how many days can ${x} men and ${y} women complete the same work?`,
               ans: `${ans.toFixed(0)} days`,
               wrong: [`${(ans*2).toFixed(0)} days`, `${(ans/2).toFixed(0)} days`, `${(ans+5).toFixed(0)} days`],
               expl: `Use formula: Time = (M1 * W1 * D) / (M1*W2 + M2*W1). OR convert all to Men: ${y} women = ${y/2} Men. Total ${x}+${y/2} Men. Compares to original ${m} Men.`,
               diff: "Hard"
          };
      },
      // 7. Alternating Work
      (i: number) => {
          const a = 10, b = 15; // LCM 30. A=3, B=2.
          // A starts.
          // Day 1: A(3), Rem 27. Day 2: B(2), Rem 25. Cycle 5u/2days.
          // 30 / 5 = 6 cycles -> 12 days.
           return {
               text: `A does a work in 10 days, B in 15 days. If they work on alternate days starting with A, when will work end?`,
               ans: `12 days`,
               wrong: [`12.5 days`, `13 days`, `11 days`],
               expl: `LCM 30. A=3u, B=2u. 2 days = 5u. 30/5 = 6 cycles. 6*2 = 12 days.`,
               diff: "Medium"
           };
      }
  ];

  for(let i=0; i<count; i++) {
        // Round robin selection of templates to ensure variety
        const template = templates[i % templates.length];
        const q = template(i);
        questions.push({
            id: `gen-qa-tw-v3-${startId + i}`,
            topic_id: "qa-time-work",
            section_id: "QA",
            question_text: q.text,
            option_a: q.ans,
            option_b: q.wrong[0],
            option_c: q.wrong[1],
            option_d: q.wrong[2],
            correct_option: "A",
            explanation: q.expl,
            difficulty: q.diff as any,
            is_active: true
        });
  }
  return seededShuffle(questions, "qa-time-work-final");
}

function seededShuffle(array: Question[], seed: string) {
    // Just a placeholder for actual shuffle, reusing the definition inside hook is better 
    // but generating in random order is fine too by RNG usage above.
    // We'll trust the input generation order is "random enough" due to modulus or explicit shuffle here
    // Fisher Yates logic
    let m = array.length, t, i;
    // Simple PRNG for shuffle
    let h = 0x12345678;
    const random = () => { h = Math.imul(h ^ h >>> 16, 2654435761); return ((h >>> 0) / 4294967296); };
    while (m) {
        i = Math.floor(random() * m--);
        t = array[m]; array[m] = array[i]; array[i] = t;
    }
    return array;
}


export function generatePercentage(count: number, startId: number): Question[] {
    const questions: Question[] = [];
    const rng = new SeededRNG("qa-pct-5block-v1");

    // Block A: Population Growth/Decline (Successive) (20 Q)
    const genBlockA = (idx: number) => {
        // Pop increases by 10% 1st year, decreases by 20% 2nd year.
        // Present is given. Find 2 years Ago (Reversal).
        // Or 2 Years Ago given. Find Present.
        // "No single step" -> Use 2-3 years.
        
        const p1 = rng.pick([10, 20, 25]);
        const p2 = rng.pick([10, 20]);
        const initial = 50000;
        
        // Let's do: Present 50000. 1st year +p1, 2nd year -p2.
        const mid = initial * (1 + p1/100);
        const final = mid * (1 - p2/100);
        
        // Q: If final is known, find initial? (Reversal)
        return {
            text: `The population of a city increased by ${p1}% in the first year and decreased by ${p2}% in the next year. If the population after 2 years is ${final.toFixed(0)}, what was the initial population?`,
            ans: `${initial}`,
            wrong: [`${final * 1.1}`, `${initial + 5000}`, `${final / (1 - (p1-p2)/100)}`, `${initial - 2000}`],
            expl: `Let initial be P. P * (1+${p1}/100) * (1-${p2}/100) = ${final.toFixed(0)}. Solve for P.`,
            diff: "Medium"
        };
    };

    // Block B: Compounded Increase (Depreciation) (20 Q)
    const genBlockB = (idx: number) => {
        // Value of machine depreciates at 10% p.a.
        // If present value is X, what was it 2 years ago?
        // Or "Value becomes X times in Y years"?
        // Let's do: Present Value P. Depreciates D%.
        // Value 2 years hence? No, "What was value 2 years ago" is better reversal.
        
        const r = 10;
        const present = 8100;
        // 2 years ago -> P * (0.9)^2 = 8100. P * 0.81 = 8100. P = 10000.
        const ago = present / (0.81); 
        
        return {
            text: `The value of a machine depreciates at the rate of ${r}% per annum. If its present value is Rs. ${present}, what was its value 2 years ago?`,
            ans: `Rs. ${ago.toFixed(0)}`,
            wrong: [`Rs. ${present * 1.2}`, `Rs. 9000`, `Rs. 8910`],
            expl: `Let value 2 years ago be V. V * (1 - 10/100)^2 = ${present}. V * 0.81 = ${present}. V = 10000.`,
            diff: "Medium"
        };
    };

    // Block C: Reverse Percentage (A is X% > B, B is ?% < A) (20 Q)
    const genBlockC = (idx: number) => {
        // If A is 25% more than B, B is ?% less than A?
        const p = rng.pick([20, 25, 50, 60]);
        // Ans = (p / (100+p)) * 100.
        const ans = (p / (100+p)) * 100;
        
        return {
            text: `If A's income is ${p}% more than B's income, then by what percentage is B's income less than that of A?`,
            ans: `${ans.toFixed(2)}%`,
            wrong: [`${p}%`, `${(p/2).toFixed(2)}%`, `${(p-5).toFixed(2)}%`],
            expl: `Formula: [R / (100+R)] * 100. Here R=${p}.`,
            diff: "Easy"
        };
    };

    // Block D: Linked Groups (Venn/Sets) (20 Q)
    const genBlockD = (idx: number) => {
        // In an exam, 60% passed in Math, 70% in Eng, 50% in Both.
        // Fail in both?
        // Formula: n(AuB) = n(A)+n(B)-n(AnB) = 60+70-50 = 80%.
        // Passed at least one = 80%.
        // Failed both = 100 - 80 = 20%.
        const passA = 60;
        const passB = 70;
        const both = 50;
        const failBoth = 100 - (passA + passB - both);
        
        return {
            text: `In an examination, ${passA}% candidates passed in Math and ${passB}% in English. If ${both}% passed in both, what percentage of candidates failed in both subjects?`,
            ans: `${failBoth}%`,
            wrong: [`10%`, `30%`, `40%`],
            expl: `Passed in at least one = 60+70-50 = 80%. Failed in both = 100 - 80 = 20%.`,
            diff: "Medium"
        };
    };

    // Block E: Time-based / Income-Expenditure (20 Q)
    const genBlockE = (idx: number) => {
        // Income increased by 20%, Exp increased by 10%. Savings increased by?
        // Let Income=100. Exp=75 (Assume). Sav=25.
        // New Inc=120. New Exp = 75*1.1 = 82.5.
        // New Sav = 120 - 82.5 = 37.5.
        // Sav Increase = (37.5 - 25)/25 * 100 = 12.5/25 = 50%.
        
        const incP = 20;
        const expP = 10;
        // Assume initial Ratio 4:3 (Inc:Exp). Sav 1.
        // Inc=400, Exp=300, Sav=100.
        // New Inc=480. New Exp=330. New Sav=150.
        // Increase = 50%.
        
        return {
            text: `A man spends 75% of his income. His income increases by ${incP}% and his expenditure increases by ${expP}%. By what percentage does his savings increase?`,
            ans: `50%`,
            wrong: [`10%`, `25%`, `35%`],
            expl: `Let Income=100. Exp=75. Sav=25. New Inc=120. New Exp=82.5. New Sav=37.5. Increase = (12.5/25)*100 = 50%.`,
            diff: "Hard"
        };
    };

    const blocks = [genBlockA, genBlockB, genBlockC, genBlockD, genBlockE];
    const questionsPerBlock = Math.ceil(count / 5);

    for (let b = 0; b < 5; b++) {
        for (let k = 0; k < questionsPerBlock; k++) {
            if (questions.length >= count) break;
            const qData = blocks[b](k);
            
            questions.push({
                id: `gen-qa-pct-block${b}-${startId + questions.length}`,
                topic_id: "qa-percentage",
                section_id: "QA",
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



export function generateProfitLoss(count: number, startId: number): Question[] {
    const questions: Question[] = [];
    const rng = new SeededRNG("qa-pl-5block-v1");

    // Block A: Dishonest Shopkeeper (Markup + False Weight) (20 Q)
    const genBlockA = (idx: number) => {
        // Mark up by M%. Weight is W grams instead of 1000.
        // Formula: Profit% = [(100+M)*(1000/W) - 100]
        // Or simple: Cost = W * 1. Rev = 1000 * (1+M/100) * 1.
        // Profit = (Rev - Cost)/Cost.
        
        const markup = rng.pick([10, 20, 25, 30]);
        const weight = rng.pick([800, 900, 750, 850]);
        
        // Rev for "1kg sold" (which is actually `weight` gms cost)
        // Let CP of 1gm = 1.
        // Cost Incurred = weight * 1.
        // Price Charged = 1000 * (1 + markup/100).
        
        const cost = weight;
        const rev = 1000 * (1 + markup/100);
        const profit = ((rev - cost) / cost) * 100;
        
        return {
            text: `A dishonest dealer marks his goods ${markup}% above cost price but uses a false weight of ${weight}gm for a kg. Find his effective gain %.`,
            ans: `${profit.toFixed(2)}%`,
            wrong: [`${markup + (1000-weight)/10}%`, `${markup + 10}%`, `${profit.toFixed(0)}%`, `${(profit-2).toFixed(2)}%`],
            expl: `Cost for ${weight}g = ${weight}. SP for ${weight}g = SP of 1kg = 1000(1+${markup}/100) = ${rev}. Profit = (${rev}-${weight})/${weight} * 100.`,
            diff: "Hard"
        };
    };

    // Block B: Successive Markup & Discount (Base Change) (20 Q)
    const genBlockB = (idx: number) => {
        // MP is 40% above CP. Discount 10% on MP. Profit?
        // Base change: CP -> MP (Base CP). SP (Base MP).
        const mk = rng.pick([20, 30, 40, 50]);
        const disc = rng.pick([10, 15, 20, 25]);
        
        // Let CP = 100. MP = 100+mk. SP = MP(1 - disc/100).
        // Profit = SP - 100.
        const mp = 100 + mk;
        const sp = mp * (1 - disc/100);
        const p = sp - 100;
        
        return {
            text: `A shopkeeper marks an article ${mk}% above the CP and allows a discount of ${disc}% on the marked price. His gain percent is?`,
            ans: `${p.toFixed(2)}%`,
            wrong: [`${(mk-disc).toFixed(2)}%`, `${(mk-disc-5).toFixed(2)}%`, `${(p+2).toFixed(2)}%`],
            expl: `MP = 100 + ${mk}. SP = ${mp} * (1 - ${disc/100}) = ${sp}. Profit = ${sp} - 100 = ${p.toFixed(2)}%.`,
            diff: "Medium"
        };
    };

    // Block C: Cheating Buying & Selling (False Weights II) (20 Q)
    const genBlockC = (idx: number) => {
        // Cheats 10% while buying (Takes 1100gm for price of 1000gm)
        // Cheats 10% while selling (Gives 900gm for price of 1000gm).
        // CP base = 1000gm price. He gets 1100gm.
        // He sells 900gm for 1000gm price.
        // Effectively: He sells 900gm. He creates revenue equal to (1100/1000)*... or standard formula?
        // Standard MBA Formula for x% cheating both sides: (x+x + x*x/100)% ?? 
        // Or Explicit: 
        // Buy: Pays 100, Gets 110. (Cost/unit = 100/110 = 0.909)
        // Sell: Gets 100, Gives 90. (Rev/unit = 100/90 = 1.11).
        // Profit % = (1.11 - 0.909)/0.909 ?
        // Usually questions mean: "Uses weight of 1100g instead of 1000g" and "900g instead of 1000g".
        // Let's stick to explicit weight logic to avoid ambiguity of "10% cheating".
        
        const buyG = 1100; // Gets 1100 for price of 1000
        const sellG = 900; // Gives 900 for price of 1000
        // Total Rev from 1100g = (1100/900) * 1000? 
        // No, let's say he transacts 1 kg nominal.
        // Gain % = [(BuyWt / SellWt) * (100+Mk)/100 - 1] * 100. Assuming Mk=0.
        const p = ((buyG/sellG) - 1) * 100;
        
        return {
            text: `A dealer cheats ${((buyG-1000)/10).toFixed(0)}% while buying (by taking ${buyG}gm for 1kg) and ${((1000-sellG)/10).toFixed(0)}% while selling (by giving ${sellG}gm for 1kg). Find his actual profit %.`,
            ans: `${p.toFixed(2)}%`,
            wrong: [`20%`, `21%`, `22.22%`, `19%`],
            expl: `Profit depends on goods ratio: Bought ${buyG}g, Sold ${sellG}g for same nominal price. Ratio = ${buyG}/${sellG}. Profit = (${buyG}-${sellG})/${sellG} * 100.`,
            diff: "Hard"
        };
    };

    // Block D: Same SP, Different CP (20 Q)
    const genBlockD = (idx: number) => {
        // Man sells two items at Rs. 9900 each.
        // On one he gains 10%, on other loses 10%.
        // Net result?
        const sp = 9900;
        const pct = rng.pick([10, 20, 25]);
        // Loss % = x^2/100
        const loss = (pct * pct) / 100;
        
        return {
            text: `Two horses were sold for Rs. ${sp} each. One at a gain of ${pct}% and the other at a loss of ${pct}%. The entire transaction resulted in?`,
            ans: `${loss}% Loss`,
            wrong: [`No Profit No Loss`, `${loss}% Profit`, `${pct}% Loss`, `1% Profit`],
            expl: `When SP is same and Gain% = Loss% = x, there is always a loss of x^2/100 %.`,
            diff: "Medium"
        };
    };

    // Block E: Net Zero Gain (Individual P/L) (20 Q)
    const genBlockE = (idx: number) => {
        // Sold two items for total Rs. X. 
        // 1st at 20% profit, 2nd at 30% loss.
        // Net profit/loss is 0 (No loss no gain).
        // Find CP of 1st vs 2nd.
        // Eq: 0.20 * CP1 - 0.30 * CP2 = 0.
        // CP1/CP2 = 3/2.
        
        const p1 = 20, l2 = 30; // 2CP1 = 3CP2.
        const totalCP = 5000; // Divisible by 2+3=5.
        const cp1 = 3000;
        const cp2 = 2000;
        
        return {
            text: `A man buys two watches for a total of Rs. ${totalCP}. He sells one at ${p1}% profit and other at ${l2}% loss. There is no loss or gain in the whole transaction. The Cost Price of the watch sold at profit is?`,
            ans: `Rs. ${cp1}`,
            wrong: [`Rs. ${cp2}`, `Rs. 2500`, `Rs. 3500`],
            expl: `No gain/loss => Profit1 = Loss2. ${p1}% of CP1 = ${l2}% of CP2. Ratio CP1:CP2 = ${l2}:${p1} = 3:2. CP1 = 3/5 * ${totalCP}.`,
            diff: "Hard"
        };
    };

    const blocks = [genBlockA, genBlockB, genBlockC, genBlockD, genBlockE];
    const questionsPerBlock = Math.ceil(count / 5);

    for (let b = 0; b < 5; b++) {
        for (let k = 0; k < questionsPerBlock; k++) {
            if (questions.length >= count) break;
            const qData = blocks[b](k);
            
            questions.push({
                id: `gen-qa-pl-block${b}-${startId + questions.length}`,
                topic_id: "qa-profit-loss",
                section_id: "QA",
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
    return questions; // No shuffle here to keep blocks distinct if debugging, or shuffle in hook
}

