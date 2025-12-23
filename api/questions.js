// api/questions.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    try {
        const { category_id, level_number, limit = 100 } = req.query;

        if (!category_id || !level_number) {
            return res.status(400).json({
                error: "category_id and level_number are required"
            });
        }

        // 🔑 Resolve level_id from level_number
        const { data: level, error: levelError } = await supabase
            .from("levels")
            .select("id")
            .eq("category_id", category_id)
            .eq("level_number", level_number)
            .single();

        if (levelError || !level) {
            return res.status(404).json({
                error: "Invalid level for category"
            });
        }

        const { data: questions, error } = await supabase
            .from("questions")
            .select(`
        id,
        q_text,
        choices,
        correct_index,
        explanation
      `)
            .eq("category_id", category_id)
            .eq("level_id", level.id)
            .limit(Number(limit));

        if (error) throw error;

        return res.json({ questions });

    } catch (err) {
        console.error("questions api error:", err);
        return res.status(500).json({ error: err.message });
    }
}
