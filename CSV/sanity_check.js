const fs = require('fs');
const { parse } = require('csv-parse/sync');

// Configurations
const wavePath = 'Wave 2 2025.csv';
const scorecardPath = 'Scorecard.csv';
const weightsPath = 'Section Weight.csv';

const waveContent = fs.readFileSync(wavePath, 'utf8');
const scorecardContent = fs.readFileSync(scorecardPath, 'utf8');
const weightsContent = fs.readFileSync(weightsPath, 'utf8');

// 1. Parse Section Weights
const weightsRecords = parse(weightsContent, { columns: true, delimiter: ';', skip_empty_lines: true, trim: true, bom: true });
const WEIGHTS = {};
weightsRecords.forEach(r => {
    const vals = Object.values(r);
    const name = (vals[0] || '').trim();
    const weight = parseInt(vals[1]);
    if (name && weight) {
        const letterMatch = name.match(/([A-K])\./);
        if (letterMatch) WEIGHTS[letterMatch[1]] = weight;
    }
});

// 2. Parse Scorecard to build Section-to-Items mapping
const scorecardRecords = parse(scorecardContent, { columns: true, delimiter: ';', skip_empty_lines: true, trim: true, bom: true });
const SCORECARD_ITEMS = {}; 
let totalScorecardQuestions = 0;

scorecardRecords.forEach(r => {
    const sectionRaw = r['Section'];
    const journeyRaw = r['Journey'];
    
    if (sectionRaw && journeyRaw) {
        const letterMatch = sectionRaw.match(/([A-K])\./);
        const codeMatch = journeyRaw.match(/^\((\d+)\)/);
        if (letterMatch && codeMatch) {
            const letter = letterMatch[1];
            const code = codeMatch[1];
            if (!SCORECARD_ITEMS[letter]) SCORECARD_ITEMS[letter] = [];
            
            // Add if it doesn't already exist
            if (!SCORECARD_ITEMS[letter].find(item => item.code === code)) {
                SCORECARD_ITEMS[letter].push({ code: code, text: journeyRaw });
                totalScorecardQuestions++;
            }
        }
    }
});
console.log("=== SCORECARD METADATA ===");
console.log(`Total Quantitative Questions in Scorecard: ${totalScorecardQuestions}`);
Object.keys(SCORECARD_ITEMS).forEach(k => {
    console.log(` - Section ${k}: ${SCORECARD_ITEMS[k].length} questions`);
});
console.log("");

// 3. Compare with Wave Data Headers
const waveRecords = parse(waveContent, { columns: true, delimiter: ';', skip_empty_lines: true, trim: true, bom: true });
const headers = Object.keys(waveRecords[0]);

console.log("=== 1. SANITY CHECK: SCORECARD VS CSV HEADERS ===");
let missingInHeader = [];
Object.keys(SCORECARD_ITEMS).forEach(sec => {
    SCORECARD_ITEMS[sec].forEach(item => {
        // find quantitative column
        const colExists = headers.find(h => h.includes(`(${item.code})`) && !h.endsWith('Text') && !h.endsWith('mi)'));
        if (!colExists) {
            missingInHeader.push(item.code);
            console.log(`[WARNING] Scorecard item (${item.code}) NOT FOUND in Wave data headers as a quantitative column.`);
        }
    });
});
if (missingInHeader.length === 0) {
    console.log("All Scorecard quantitative items match perfectly with 'Wave 2 2025.csv' Headers! ✅");
}
console.log("");

// 4. Scoring Logic Check on 5 Random Stores
function parseItemScore(val) {
    if (!val) return null;
    const s = String(val);
    if (s.includes('(1/1)') || s.includes('100.00')) return 1;
    if (s.includes('(0/1)') || s.includes('0.00')) return 0;
    return null; // N/A, empty or qualitative
}

console.log("=== 2. SANITY CHECK: SCORING LOGIC ON 5 RANDOM STORES ===");
const randomStores = [];
for(let i=0; i<5; i++) {
    const rInt = Math.floor(Math.random() * waveRecords.length);
    randomStores.push(waveRecords[rInt]);
}

randomStores.forEach((store) => {
    const storeName = store['Site Name'] || store['Branch'] || 'Unknown Store';
    console.log(`\nEvaluating Store: ${storeName}`);
    
    const sections = {}; 
    let earnedPoints = 0;
    let maxPointsPossible = 0;

    Object.keys(SCORECARD_ITEMS).forEach(sec => {
        let itemsCount = 0;
        let itemsScore = 0;
        
        SCORECARD_ITEMS[sec].forEach(item => {
            const col = headers.find(h => h.includes(`(${item.code})`) && !h.endsWith('Text') && !h.endsWith('mi)'));
            if (col) {
                const val = store[col];
                const score = parseItemScore(val);
                if (score !== null) {
                    itemsCount++;
                    itemsScore += score;
                }
            }
        });
        
        if (itemsCount > 0) {
            const secAvg = (itemsScore / itemsCount) * 100;
            sections[sec] = secAvg;
            
            const w = WEIGHTS[sec] || 0;
            earnedPoints += (secAvg / 100) * w;
            maxPointsPossible += w;
            
            // Compare section score with CSV
            const csvSecCol = headers.find(h => h.includes(`(Section) ${sec}.`));
            const csvSecVal = csvSecCol ? parseFloat(String(store[csvSecCol]).replace(',', '.')) : null;
            
            const diffSec = Math.abs(secAvg - csvSecVal);
            if(diffSec > 0.1) {
                console.log(`  [WARN] Section ${sec} Logic Mismatch | Calc: ${secAvg.toFixed(2)} | CSV: ${csvSecVal}`);
            }
        } else {
             sections[sec] = null;
        }
    });
    
    const csvFinalStr = String(store['Final Score'] || '0').replace(',', '.');
    const csvFinal = parseFloat(csvFinalStr);
    
    let calcFinal = 0;
    if (maxPointsPossible > 0) {
        calcFinal = (earnedPoints / maxPointsPossible) * 100;
    }
    
    console.log(`> Calculated Final Score: ${calcFinal.toFixed(2)}`);
    console.log(`> Official CSV Final Score: ${csvFinal.toFixed(2)}`);
    const diff = Math.abs(calcFinal - csvFinal);
    if (diff < 0.1) {
        console.log(`> Result: PERFECT MATCH ✅`);
    } else {
        console.log(`> Result: MISMATCH ❌ (Diff: ${diff.toFixed(2)})`);
    }
});
