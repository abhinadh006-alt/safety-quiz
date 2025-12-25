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
                error: "category_id required",
            });
        }

        const { data, error } = await supabase
            .from("levels")
            .select("id, name, level_number")
            .eq("category_id", category_id)
            .order("level_number", { ascending: true });

        if (error) throw error;

        return res.status(200).json({
            ok: true,
            levels: data || [],
        });
    } catch (err) {
        console.error("levels api error:", err);
        return res.status(500).json({
            ok: false,
            error: err.message,
        });
    }
}
