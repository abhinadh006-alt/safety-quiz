// generate_balanced_csv.mjs
import { writeFile } from 'fs/promises';

/*
  Generates a CSV with exactly 100 unique questions and a balanced distribution
  of correct_index (25 each for 0..3). The script creates well-formed CSV
  where the `choices` cell is a JSON array string and properly quoted for CSV import.
*/

function csvEscapeCell(s) {
    // wrap cell in double quotes and double inner quotes
    return `"${String(s).replace(/"/g, '""')}"`;
}

// Example base Qs (use your existing 82/94 questions here). For demo we'll generate filler Qs.
const base = [
    // Put your existing questions here (objects with q_text, choices array, explanation).
    // Example item:
    { q_text: 'What is the main purpose of a risk assessment?', choices: ['Identify hazards', 'Increase staff', 'Decorate workplace', 'Improve marketing'], explanation: 'Risk assessments identify hazards to prevent harm.' },
    { q_text: 'Which item is an example of a workplace hazard?', choices: ['Wet floor', 'Clean desk', 'Office chair', 'Email inbox'], explanation: 'A wet floor can cause slips.' },
    // ... (add your other existing questions if you want) ...
];

// If you already have many questions, you can push them into "base".

// For the demo we will create synthetic unique questions to reach 100 rows.
// In your real use-case, replace synthetic generator with your own question content.
function makeSyntheticQuestion(i) {
    return {
        q_text: `Synthetic question #${i}: Example content for item ${i}?`,
        choices: [
            `Option A for ${i}`,
            `Option B for ${i}`,
            `Option C for ${i}`,
            `Option D for ${i}`,
        ],
        explanation: `Explanation for synthetic question #${i}.`
    };
}

// Compose a pool of unique questions
const pool = [...base];
let idx = 1;
while (pool.length < 100) {
    const q = makeSyntheticQuestion(idx);
    // avoid duplicates by q_text (just in case)
    if (!pool.some(p => p.q_text === q.q_text)) pool.push(q);
    idx++;
}

// Now we have >=100; trim to exactly 100
const selected = pool.slice(0, 100);

// Balanced assignment of correct_index: 25 each of 0..3
const distribution = [];
for (let opt = 0; opt < 4; opt++) {
    for (let k = 0; k < 25; k++) distribution.push(opt);
}
// shuffle distribution to randomize which question gets which correct index
function shuffle(arr, seed) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
shuffle(distribution);

// assign correct_index based on distribution (randomized order)
const rows = selected.map((q, i) => {
    const correct_index = distribution[i];
    // rotate choices so correct answer isn't always position 0 (optional)
    // but simplest: shuffle choices then pick one index as correct_index position.
    // We'll shuffle choices but then ensure the correct answer string is placed at the chosen index.
    const choices = [...q.choices];
    // choose a canonical correct choice answer text:
    const correctChoiceText = choices[0]; // assume the first item is the intended correct text in source
    // shuffle choices first
    shuffle(choices);
    // ensure the correctChoiceText appears at distribution[i]
    const currentIdx = choices.indexOf(correctChoiceText);
    if (currentIdx !== distribution[i]) {
        [choices[currentIdx], choices[distribution[i]]] = [choices[distribution[i]], choices[currentIdx]];
    }
    // final correct_index is distribution[i]
    return {
        category_id: 1,
        level_id: 1,
        q_text: q.q_text,
        choices: JSON.stringify(choices),
        correct_index: distribution[i],
        explanation: q.explanation
    };
});

// Build CSV
const header = 'category_id,level_id,q_text,choices,correct_index,explanation\n';
const lines = rows.map(r => {
    return [
        r.category_id,
        r.level_id,
        csvEscapeCell(r.q_text),
        csvEscapeCell(r.choices), // choices is a JSON string -> must be CSV-escaped
        r.correct_index,
        csvEscapeCell(r.explanation)
    ].join(',');
});

const csv = header + lines.join('\n');

await writeFile('category1_level1_100_balanced.csv', csv, 'utf8');

console.log('Wrote category1_level1_100_balanced.csv (100 rows, balanced answers 25 each).');
