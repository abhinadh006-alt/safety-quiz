// api/questions.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY   // ✅ FIXED
);

export default async function handler(req, res) {
    const { category_id, level_number, limit = 100, shuffle } = req.query;

    if (!category_id || !level_number) {
        return res.status(400).json({
            ok: false,
            error: "category_id and level_number are required",
        });
    }

    try {
        // 1️⃣ Resolve level_id
        const { data: level, error: levelError } = await supabase
            .from("levels")
            .select("id")
            .eq("category_id", category_id)
            .eq("level_number", level_number)
            .single();

        if (!level || levelError) {
            return res.status(200).json([]);
        }

        // 2️⃣ Fetch questions
        let query = supabase
            .from("questions")
            .select("*")
            .eq("category_id", category_id)
            .eq("level_id", level.id)
            .limit(Number(limit));

        if (Number(shuffle) === 1) {
            query = query.order("random()");
        }

        const { data, error } = await query;
        if (error) throw error;

        return res.status(200).json(data);
    } catch (err) {
        console.error("questions api error:", err);
        return res.status(500).json({ error: err.message });
    }
}
