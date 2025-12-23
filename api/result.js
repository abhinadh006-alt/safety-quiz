import { createClient } from "@supabase/supabase-js";

export default async function getResultHandler(req, res) {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: "Missing id" });
        }

        const svc = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        const { data, error } = await svc
            .from("results")
            .select("id, username, score, total, created_at")
            .eq("id", id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: "Result not found" });
        }

        return res.json({ row: data });
    } catch (err) {
        console.error("GET /api/result failed", err);
        return res.status(500).json({ error: "server_error" });
    }
}
