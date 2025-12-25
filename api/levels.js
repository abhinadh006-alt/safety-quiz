// api/levels.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY   // ✅ FIXED
);

export default async function handler(req, res) {
    const { category_id } = req.query;

    if (!category_id) {
        return res.status(400).json({ error: "category_id required" });
    }

    try {
        const { data, error } = await supabase
            .from("levels")
            .select("id, name, level_number")
            .eq("category_id", category_id)
            .order("level_number", { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        console.error("levels api error:", err);
        res.status(500).json({ error: err.message });
    }
}
