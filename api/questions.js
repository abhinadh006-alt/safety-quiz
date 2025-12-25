// api/questions.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
    try {
        const {
            category_id,
            level_number,
            limit = 100,
            shuffle = 0
        } = req.query;

        if (!category_id || !level_number) {
            return res.status(400).json({
                error: "category_id and level_number are required"
            });
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        /* 🔹 STEP 1: Convert level_number → level_id */
        const { data: level, error: levelError } = await supabase
            .from("levels")
            .select("id")
            .eq("category_id", category_id)
            .eq("level_number", level_number)
            .single();

        if (levelError || !level) {
            return res.status(404).json({
                error: "Invalid level_number for this category"
            });
        }

        /* 🔹 STEP 2: Fetch questions using level_id */
        let query = supabase
            .from("questions")
            .select("*")
            .eq("category_id", category_id)
            .eq("level_id", level.id)
            .limit(Number(limit));

        const { data: questions, error } = await query;

        if (error) throw error;

        /* 🔹 STEP 3: Optional shuffle */
        if (shuffle === "1") {
            questions.sort(() => Math.random() - 0.5);
        }

        res.status(200).json({
            ok: true,
            count: questions.length,
            questions
        });

    } catch (err) {
        console.error("Questions API error:", err);
        res.status(500).json({ error: err.message });
    }
}
