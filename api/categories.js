import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("id");

        if (error) throw error;

        res.setHeader("Cache-Control", "no-store");
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
