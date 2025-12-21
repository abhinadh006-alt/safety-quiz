import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

export default async function submitResultHandler(req, res) {
    try {
        // 🔒 STEP 1: AUTH CHECK
        const cookieHeader = req.headers.cookie || "";
        const tokenMatch = cookieHeader.match(/token=([^;]+)/);

        if (!tokenMatch) {
            return res.status(401).json({ ok: false, error: "Not authenticated" });
        }

        let payload;
        try {
            payload = jwt.verify(tokenMatch[1], process.env.JWT_SECRET);
        } catch {
            return res.status(401).json({ ok: false, error: "Invalid session" });
        }

        // 🔧 STEP 2: READ REQUEST BODY
        const { score = 0, total = 0 } = req.body || {};

        // 🔧 STEP 3: SUPABASE CLIENT
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
            console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
            return res.status(500).json({ ok: false, error: "supabase_credentials_missing" });
        }

        const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // 🔧 STEP 4: INSERT RESULT
        const id = crypto.randomUUID
            ? crypto.randomUUID()
            : `r_${Date.now()}`;

        const { data, error } = await svc
            .from("results")
            .insert([{
                id,
                username: payload.sub,   // WhatsApp phone or Telegram ID
                score: Number(score),
                total: Number(total)
            }])
            .select("id")
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            return res.status(500).json({ ok: false, error: "db_insert_failed" });
        }

        // ✅ SUCCESS
        return res.json({ ok: true, id: data.id });

    } catch (err) {
        console.error("Unhandled error /api/submit-result:", err);
        return res.status(500).json({ ok: false, error: "server_error" });
    }
}
