// api/verify-telegram.js
import crypto from "crypto";
import jwt from "jsonwebtoken";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const APP_URL = process.env.APP_URL || "https://safety-quiz.vercel.app"; // set this in Vercel

function verifyTelegramAuth(data) {
    // data is the object Telegram returns to the page (contains 'hash')
    const hash = data.hash;
    const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
    const pairs = [];
    Object.keys(data).sort().forEach(k => {
        if (k === "hash") return;
        pairs.push(`${k}=${data[k]}`);
    });
    const data_check_string = pairs.join("\n");
    const hmac = crypto.createHmac("sha256", secretKey).update(data_check_string).digest("hex");
    return hmac === hash;
}

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    try {
        const body = req.body;
        if (!body || !body.hash) return res.status(400).json({ ok: false, error: "Missing payload" });

        if (!BOT_TOKEN || !CHANNEL_ID) {
            return res.status(500).json({ ok: false, error: "Server not configured" });
        }

        // Verify the Telegram widget signature
        if (!verifyTelegramAuth(body)) {
            return res.status(401).json({ ok: false, error: "Invalid auth signature" });
        }

        const user_id = body.id;

        // Check channel membership
        const apiResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${encodeURIComponent(CHANNEL_ID)}&user_id=${user_id}`);
        const json = await apiResp.json();

        if (!json.ok) {
            // Telegram API returned an error (not in channel, invalid chat id, etc.)
            return res.status(403).json({ ok: false, error: "Telegram API error", details: json });
        }

        const status = json.result?.status || "";
        const allowed = ["creator", "administrator", "member"].includes(status);
        if (!allowed) {
            return res.status(403).json({ ok: false, error: "not a channel member", status });
        }

        // Create JWT for the user, 1 hour expiry
        const payload = {
            sub: String(user_id),
            username: body.username || null,
            first_name: body.first_name || null,
        };
        const token = jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn: "1h" });

        // Build cookie string
        const maxAge = 60 * 60; // 1 hour
        // Secure must be present in production (HTTPS). For local dev, you may remove Secure.
        const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict; Secure`;

        res.setHeader("Set-Cookie", cookie);

        // Redirect user to the app landing (/app)
        const redirectTo = `${APP_URL}/app`;
        const html = `<!doctype html>
<meta charset="utf-8">
<title>Redirecting…</title>
<script>window.location.replace(${JSON.stringify(redirectTo)});</script>
<p>Redirecting… If you are not redirected, <a href="${redirectTo}">click here</a>.</p>`;

        return res.status(200).setHeader("Content-Type", "text/html").send(html);

    } catch (err) {
        console.error("verify-telegram error:", err);
        return res.status(500).json({ ok: false, error: "server error", details: String(err) });
    }
}
