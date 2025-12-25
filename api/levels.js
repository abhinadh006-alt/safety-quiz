// api/levels.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
    try {
        const { category_id } = req.query;

        if (!category_id) {
            return res.status(400).json({ error: "category_id required" });
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        const { data, error } = await supabase
            .from("levels")
            .select("id, name, level_number")
            .eq("category_id", category_id)
            .order("level_number", { ascending: true });


        if (error) throw error;

        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
