// api/levels.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    try {
        const { category_id } = req.query;

        if (!category_id) {
            return res.status(400).json({
                ok: false,
                error: "category_id is required"
            });
        }

        const { data: level, error: levelError } = await supabase
            .from("levels")
            .select("id")
            .eq("category_id", category_id)
            .eq("level_number", level_number)
            .single();

        if (levelError || !level) {
            return res.json({ ok: true, questions: [] });
        }

    } catch (err) {
        console.error("levels api error:", err);
        return res.status(500).json({
            ok: false,
            error: err.message
        });
    }
}
