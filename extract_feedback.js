const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const csvDir = path.join(__dirname, 'CSV');
const files = [
    'Wave 1 2024.csv',
    'Wave 2 2024.csv',
    'Wave 3 2024.csv',
    'Wave 1 2025.csv',
    'Wave 2 2025.csv'
];

let allFeedbacks = new Set();

const ignorePhrases = [
    'tidak ada', 'tdk ada', 'sudah bagus', 'cukup', 'baik', 'oke', 'ok',
    'aman', 'tidak', 'gak ada', 'ngga ada', 'ga ada', 'bagus', 'keren',
    'mantap', 'memuaskan', 'sangat baik', 'tidak ada komentar', 'belum ada',
    'semua baik', 'good', '-'
];

for (const file of files) {
    const filePath = path.join(csvDir, file);
    if (!fs.existsSync(filePath)) {
        console.log(`File missing: ${file}`);
        continue;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
        columns: false,
        skip_empty_lines: true,
        delimiter: ';'
    });

    // Skip header
    for (let i = 1; i < records.length; i++) {
        const row = records[i];
        // HG is the 215th column (index 214) or just grab the last column
        const feedback = row[214] ? row[214].trim() : '';

        if (feedback && feedback.length > 3) {
            const lowerF = feedback.toLowerCase();

            let shouldIgnore = false;
            for (const phrase of ignorePhrases) {
                if (lowerF === phrase || lowerF.replace(/[^a-z]/g, '') === phrase.replace(/ /g, '')) {
                    shouldIgnore = true;
                    break;
                }
            }

            if (!shouldIgnore) {
                allFeedbacks.add(feedback);
            }
        }
    }
}

const feedbacksArray = Array.from(allFeedbacks);
console.log(`Extracted ${feedbacksArray.length} unique meaningfull feedbacks.`);

fs.writeFileSync(
    path.join(__dirname, 'raw_feedbacks.json'),
    JSON.stringify(feedbacksArray, null, 2)
);
console.log('Saved to raw_feedbacks.json');
