import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
    try {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
            return res.status(500).json({
                ok: false,
                error: "Supabase env vars missing"
            });
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        const { data, error } = await supabase
            .from("categories")
            .select("id, name")
            .order("id");

        if (error) throw error;

        // ✅ IMPORTANT: wrap in object
        return res.status(200).json({
            ok: true,
            categories: data
        });

    } catch (err) {
        console.error("categories api error:", err);
        return res.status(500).json({
            ok: false,
            error: err.message
        });
    }
}
