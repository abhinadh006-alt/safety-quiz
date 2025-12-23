import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    try {
        const { category_id, level_id, limit = 100, shuffle = 1 } = req.query;

        let query = supabase
            .from('questions')
            .select('*')
            .limit(Number(limit));

        if (category_id) query = query.eq('category_id', Number(category_id));
        if (level_id) query = query.eq('level_id', Number(level_id));

        if (shuffle === '1') {
            query = query.order('id', { ascending: false }); // lightweight shuffle
        }

        const { data, error } = await query;

        if (error) throw error;

        res.status(200).json({ questions: data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
