import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";

import accessRouter from "./api/access.js";
import { requireDailyAccess } from "./middleware/requireDailyAccess.js";
import { getTodayToken } from "./utils/dailyToken.js";

import questionsHandler from "./api/questions.js";
import submitResultRouter from "./api/submit-result.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;

/* ---------- CORS ---------- */
app.use(
    cors({
        origin: "http://localhost:5174",
        credentials: true
    })
);

app.use(bodyParser.json());

/* ---------- HEALTH ---------- */
app.get("/", (_, res) => res.send("Backend Running"));

/* ---------- DAILY ACCESS ROUTER ---------- */
app.use(accessRouter);

/* ---------- DEV LOGIN (OPTIONAL / INTERNAL) ---------- */
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

/* ---------- CATEGORIES (DAILY LINK REQUIRED) ---------- */
app.get("/api/categories", requireDailyAccess, async (req, res) => {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

    const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/categories?select=*&order=id.asc`,
        {
            headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
            }
        }
    );

    const data = await resp.json();
    res.json({ ok: true, categories: data });
});

/* ---------- LEVELS (DAILY LINK REQUIRED) ---------- */
app.get("/api/levels", requireDailyAccess, async (req, res) => {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

    const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/levels?select=*&order=id.asc`,
        {
            headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
            }
        }
    );

    const data = await resp.json();
    res.json({ ok: true, levels: data });
});

/* ---------- QUESTIONS (DAILY LINK REQUIRED) ---------- */
app.get("/api/questions", requireDailyAccess, questionsHandler);

/* ---------- SUBMIT RESULT (DAILY LINK REQUIRED) ---------- */
if (submitResultRouter) {
    app.use(requireDailyAccess, submitResultRouter);
}

/* ---------- TODAY'S WHATSAPP LINK ---------- */
app.get("/api/today-link", (req, res) => {
    const token = getTodayToken();
    const link = `${process.env.APP_URL}/?access=${token}`;

    const message = `
🛡️ Safety Quiz – Today

Click the link below to start today’s quiz.
⏳ Valid only for today.

👇👇👇
${link}
`.trim();

    res.json({
        ok: true,
        date: new Date().toISOString().slice(0, 10),
        link,
        message
    });
});

/* ---------- START SERVER ---------- */
app.listen(PORT, () =>
    console.log(`Backend running at http://localhost:${PORT}`)
);
