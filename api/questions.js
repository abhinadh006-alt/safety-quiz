import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

/**
 * GET /api/questions
 */
export default async function questionsHandler(req, res) {
    try {
        // 🔒 STEP 1: AUTH CHECK
        const cookieHeader = req.headers.cookie || "";
        const tokenMatch = cookieHeader.match(/token=([^;]+)/);

        if (!tokenMatch) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        try {
            jwt.verify(tokenMatch[1], process.env.JWT_SECRET);
        } catch {
            return res.status(401).json({ error: "Invalid session" });
        }

        // 🔧 STEP 2: EXISTING LOGIC (UNCHANGED)
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
            console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
            return res.status(500).json({ error: "supabase_credentials_missing" });
        }

        const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        const category_id = req.query.category_id ? Number(req.query.category_id) : null;
        const level_id = req.query.level_id ? Number(req.query.level_id) : null;
        const limit = req.query.limit ? Math.min(1000, Number(req.query.limit)) : 100;
        const shuffle = req.query.shuffle === "1" || req.query.shuffle === "true";

        let query = svc
            .from("questions")
            .select(
                "id, id_uuid, category_id, level_id, q_text, choices, correct_index, explanation, created_at"
            );

        if (category_id) query = query.eq("category_id", category_id);
        if (level_id) query = query.eq("level_id", level_id);

        const fetchLimit = Math.max(limit, 1000);

        const { data, error } = await query
            .order("id", { ascending: true })
            .limit(fetchLimit);

        if (error) {
            console.error("Supabase query error:", error);
            return res.status(500).json({ error: "db_error", detail: error });
        }

        const rows = Array.isArray(data) ? data : [];

        const normalized = rows.map((r) => {
            let choices = r.choices;
            if (!Array.isArray(choices)) {
                try { choices = JSON.parse(choices || "[]"); }
                catch { choices = []; }
            }
            return {
                id: r.id,
                id_uuid: r.id_uuid,
                category_id: r.category_id,
                level_id: r.level_id,
                q_text: r.q_text,
                choices,
                correct_index: Number(r.correct_index ?? 0),
                explanation: r.explanation,
                created_at: r.created_at
            };
        });

        if (shuffle) {
            for (let i = normalized.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [normalized[i], normalized[j]] = [normalized[j], normalized[i]];
            }
        }

        return res.json(normalized.slice(0, limit));

    } catch (err) {
        console.error("Unhandled error /api/questions:", err);
        return res.status(500).json({ error: "server_error" });
    }
}
