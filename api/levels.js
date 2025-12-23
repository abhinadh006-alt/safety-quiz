// api/levels.js
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    try {
        /* ---------------------------
           AUTH (Layer 4 – Cookie JWT)
        ---------------------------- */
        const cookie = req.headers.cookie || "";
        const match = cookie.match(/token=([^;]+)/);

        if (!match) {
            return res.status(401).json({
                ok: false,
                error: "Not authenticated"
            });
        }

        try {
            jwt.verify(match[1], process.env.JWT_SECRET);
        } catch {
            return res.status(401).json({
                ok: false,
                error: "Invalid session"
            });
        }

        /* ---------------------------
           SUPABASE QUERY
        ---------------------------- */
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        const { data, error } = await supabase
            .from("levels")
            .select("id, name")
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
