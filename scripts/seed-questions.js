// scripts/seed-questions.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seed() {
    const categories = Array.from({ length: 10 }, (_, i) => i + 1); // adapt to your real category ids
    const levels = Array.from({ length: 10 }, (_, i) => i + 1);

    for (const cat of categories) {
        for (const lvl of levels) {
            const rows = [];
            for (let q = 1; q <= 100; q++) {
                const id_uuid = `c${cat}l${lvl}q${q}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                const questionText = `Placeholder Q ${q} — Category ${cat}, Level ${lvl}`;
                const choices = JSON.stringify([
                    "Choice A",
                    "Choice B",
                    "Choice C",
                    "Choice D"
                ]);
                const correct_index = 0;
                rows.push({
                    id_uuid,
                    category_id: cat,
                    level_id: lvl,
                    q_text: questionText,
                    choices,
                    correct_index,
                    explanation: `Answer explanation for ${id_uuid}`
                });

                // insert in batches of 100 to avoid super-large payloads
                if (rows.length >= 100) {
                    const { data, error } = await supabase.from('questions').insert(rows);
                    if (error) {
                        console.error('insert error', error);
                        return;
                    }
                    rows.length = 0;
                    console.log(`Inserted batch for cat ${cat} lvl ${lvl}`);
                }
            }
            // leftover rows
            if (rows.length > 0) {
                const { error } = await supabase.from('questions').insert(rows);
                if (error) { console.error('insert error', error); return; }
            }
        }
    }
    console.log('done');
}

seed().catch(console.error);
