// fix_choices.mjs
import fs from 'fs/promises';

const [, , inFile, outFile] = process.argv;
if (!inFile || !outFile) {
    console.error('Usage: node fix_choices.mjs in.csv out.csv');
    process.exit(2);
}

const text = await fs.readFile(inFile, 'utf8');
const lines = text.split(/\r?\n/);
const header = lines.shift();
const out = [header];

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (!line) { out.push(''); continue; }
    // naive split by first 2 commas to keep q_text / choices intact: adapt to how many columns you have.
    // safer: parse columns by splitting at commas but respecting quoted fields.
    // We'll do a simple regex to locate the choices JSON-looking token: a `[` ... `]` between two commas.
    const match = line.match(/(^.*?,.*?,)(\[[^\]]*\])(:,.*|,.*)?$/);
    // fallback: try to identify choices by finding first '[' and the matching ']' from the right
    if (!match) {
        // fallback heuristic
        const firstBracket = line.indexOf('[');
        const lastBracket = line.lastIndexOf(']');
        if (firstBracket >= 0 && lastBracket > firstBracket) {
            const before = line.slice(0, firstBracket);
            const choicesRaw = line.slice(firstBracket, lastBracket + 1);
            const after = line.slice(lastBracket + 1);
            // ensure choicesRaw uses double quotes inside and entire field is quoted for CSV import
            const safe = '"' + choicesRaw.replace(/"/g, '""') + '"';
            out.push(before + safe + after);
            continue;
        } else {
            out.push(line);
            continue;
        }
    } else {
        const before = match[1];
        const choicesRaw = match[2];
        const after = match[3] || '';
        const safe = '"' + choicesRaw.replace(/"/g, '""') + '"';
        out.push(before + safe + after);
    }
}

await fs.writeFile(outFile, out.join('\r\n'), 'utf8');
console.log('Wrote', outFile);
