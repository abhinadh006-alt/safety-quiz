import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    const { category_id, level_id, limit = 100, shuffle = '0' } = req.query;

    if (!category_id || !level_id) {
        return res.status(400).json({
            error: 'category_id and level_id are required'
        });
    }

    let query = supabase
        .from('questions')
        .select('*')
        .eq('category_id', category_id)
        .eq('level_id', level_id)
        .limit(Number(limit));

    if (shuffle === '1') {
        query = query.order('id', { ascending: false }); // simple shuffle
    }

    const { data, error } = await query;

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
}
