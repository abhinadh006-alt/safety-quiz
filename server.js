import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";

import questionsHandler from "./server/api/questions.js";
import submitResultRouter from "./server/api/submit-result.js";
import getResultHandler from "./server/api/result.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;

/* ---------- CORS ---------- */
app.use(
    cors({
        origin: "http://localhost:5174",
        credentials: true,
    })
);

app.use(bodyParser.json());

/* ---------- HEALTH ---------- */
app.get("/", (_, res) => res.send("Backend Running"));

app.get("/api/result", getResultHandler);

/* ---------- DEV LOGIN (OPTIONAL) ---------- */
app.post("/api/dev-login", (req, res) => {
    const token = jwt.sign(
        { sub: "dev_user", role: "dev" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.setHeader(
        "Set-Cookie",
        `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
    );

    res.json({ ok: true });
});

/* ---------- CATEGORIES (OPEN) ---------- */
app.get("/api/categories", async (req, res) => {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

    const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/categories?select=*&order=id.asc`,
        {
            headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            },
        }
    );

    const data = await resp.json();
    res.json({ ok: true, categories: data });
});

/* ---------- LEVELS (OPEN) ---------- */
app.get("/api/levels", async (req, res) => {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

    const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/levels?select=*&order=id.asc`,
        {
            headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            },
        }
    );

    const data = await resp.json();
    res.json({ ok: true, levels: data });
});

/* ---------- QUESTIONS ---------- */
app.get("/api/questions", questionsHandler);

/* ---------- SUBMIT RESULT ---------- */
if (submitResultRouter) {
    app.use(submitResultRouter);
}

/* ---------- START SERVER ---------- */
export default app;