// api/questions.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    try {
        const { category_id, level_id, limit = 100 } = req.query;

        if (!category_id || !level_id) {
            return res.status(400).json({
                error: "category_id and level_id are required"
            });
        }

        const { data, error } = await supabase
            .from("questions")
            .select(`
        id,
        q_text,
        choices,
        correct_index,
        explanation
      `)
            .eq("category_id", category_id)
            .eq("level_id", level_id)
            .limit(Number(limit));

        if (error) throw error;

        return res.json({
            questions: data
        });

    } catch (err) {
        console.error("questions api error:", err);
        return res.status(500).json({
            error: err.message
        });
    }
}
