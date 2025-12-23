// api/levels.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
    try {
        const categoryId = req.query.category_id;

        if (!categoryId) {
            return res.status(400).json({
                ok: false,
                error: "category_id is required"
            });
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        const { data, error } = await supabase
            .from("levels")
            .select("id, name")
            .eq("category_id", Number(categoryId))
            .order("id", { ascending: true });

        if (error) {
            console.error("Supabase levels error:", error);
            return res.status(500).json({
                ok: false,
                error: "Database error"
            });
        }

        return res.json({
            ok: true,
            levels: data
        });

    } catch (err) {
        console.error("levels api fatal error:", err);
        return res.status(500).json({
            ok: false,
            error: "Server error"
        });
    }
}
