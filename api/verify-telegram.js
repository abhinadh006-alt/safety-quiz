// api/verify-telegram.js
// Dev-friendly: when DISABLE_TELEGRAM=true this will skip Telegram verification
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const JWT_SECRET = process.env.JWT_SECRET || "change_me_for_dev";
const APP_URL = process.env.APP_URL || "http://localhost:5174"; // front-end url
const DISABLE_TELEGRAM = (process.env.DISABLE_TELEGRAM === 'true');

function verifyTelegramAuth(data) {
    if (DISABLE_TELEGRAM) return true; // skip verification in dev
    if (!BOT_TOKEN) return false;
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
        if (!body) return res.status(400).json({ ok: false, error: "Missing payload" });

        // If DISABLE_TELEGRAM is true, skip signature and membership check
        if (!verifyTelegramAuth(body)) {
            return res.status(401).json({ ok: false, error: "Invalid auth signature" });
        }

        const user_id = String(body.id || body.user_id || (body.user && body.user.id) || "");

        // If not in dev and we have tokens, check membership
        if (!DISABLE_TELEGRAM) {
            if (!BOT_TOKEN || !CHANNEL_ID) {
                return res.status(500).json({ ok: false, error: "Server not configured" });
            }
            const apiResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${encodeURIComponent(CHANNEL_ID)}&user_id=${user_id}`);
            const json = await apiResp.json();
            if (!json.ok) {
                return res.status(403).json({ ok: false, error: "Telegram API error", details: json });
            }
            const status = json.result?.status || "";
            const allowed = ["creator", "administrator", "member"].includes(status);
            if (!allowed) {
                return res.status(403).json({ ok: false, error: "not a channel member", status });
            }
        }

        // Create JWT for the user, 1 hour expiry
        const payload = {
            sub: user_id || "dev-user",
            username: body.username || body.user?.username || null,
            first_name: body.first_name || body.user?.first_name || null,
        };
        const token = jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn: "1h" });

        // cookie: omit Secure in dev
        const maxAge = 60 * 60;
        const cookieParts = [`token=${token}`, `HttpOnly`, `Path=/`, `Max-Age=${maxAge}`, `SameSite=Strict`];
        if (process.env.NODE_ENV === 'production') cookieParts.push('Secure');
        const cookie = cookieParts.join('; ');

        res.setHeader("Set-Cookie", cookie);

        const redirectTo = `${APP_URL}/app`;
        const html = `<!doctype html><meta charset="utf-8"><title>Redirecting…</title>
      <script>window.location.replace(${JSON.stringify(redirectTo)});</script>
      <p>Redirecting… If you are not redirected, <a href="${redirectTo}">click here</a>.</p>`;
        return res.status(200).setHeader("Content-Type", "text/html").send(html);

    } catch (err) {
        console.error("verify-telegram error:", err);
        return res.status(500).json({ ok: false, error: "server error", details: String(err) });
    }
}
