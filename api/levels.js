// server/api/levels.js
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
                error: "category_id is required"
            });
        }

        const { data, error } = await supabase
            .from("levels")
            .select("id, name")
            .eq("category_id", Number(category_id))
            .order("id", { ascending: true });

        if (error) throw error;

        // ✅ Return array directly (same pattern as categories)
        return res.status(200).json(data);

    } catch (err) {
        console.error("levels api error:", err);
        return res.status(500).json({
            error: err.message || "Server error"
        });
    }
}
