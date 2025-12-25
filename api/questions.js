import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    const { category_id, level_number, limit = 100, shuffle = 0 } = req.query;

    if (!category_id || !level_number) {
        return res.status(400).json({
            ok: false,
            error: "category_id and level_number are required",
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
            error: "Level not found for category",
        });
    }

    let query = supabase
        .from("questions")
        .select("*")
        .eq("category_id", category_id)
        .in(
            "level_id",
            supabase
                .from("levels")
                .select("id")
                .eq("category_id", category_id)
                .eq("level_number", level_number)
        )
        .limit(Number(limit));


    if (Number(shuffle) === 1) {
        query = query.order("random()");
    }


    const { data, error } = await query;

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
}
