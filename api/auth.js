// api/auth.js
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const APP_URL = process.env.APP_URL || "https://safety-quiz.vercel.app";

export default async function handler(req, res) {
    try {
        const token = req.query.token || (req.method === "POST" && req.body?.token);
        if (!token) return res.status(400).send("Missing token");

        // Verify the short-lived login token
        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (e) {
            console.error("login token verify err:", e.message);
            return res.status(401).send("Invalid or expired login link");
        }

        const userId = payload.sub;
        if (!userId) return res.status(400).send("Invalid token payload");

        // Double-check membership via Telegram API
        const checkResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${encodeURIComponent(CHANNEL_ID)}&user_id=${userId}`);
        const checkJson = await checkResp.json();
        if (!checkJson.ok) {
            return res.status(403).send("Unable to verify membership with Telegram");
        }
        const status = checkJson.result?.status || "";
        const allowed = ["member", "administrator", "creator"].includes(status);
        if (!allowed) {
            return res.status(403).send("You are not a member of the required channel. Please join and retry.");
        }

        // Create session JWT (longer lived) - cookie session
        const sessionToken = jwt.sign(
            { sub: String(userId), username: payload.username || null },
            JWT_SECRET,
            { algorithm: "HS256", expiresIn: "7d" } // adjust as you like
        );

        const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
        // Important: Secure required in production (HTTPS). SameSite Lax to allow link navigation.
        const cookie = `token=${sessionToken}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;

        res.setHeader("Set-Cookie", cookie);

        // Redirect to the app area
        const redirectTo = `${APP_URL}/app`;
        const html = `<!doctype html><meta charset="utf-8"><title>Signed in</title>
      <script>window.location.replace(${JSON.stringify(redirectTo)});</script>
      <p>Signing in… If you are not redirected, <a href="${redirectTo}">click here</a>.</p>`;
        return res.status(200).setHeader("Content-Type", "text/html").send(html);

    } catch (err) {
        console.error("/api/auth error:", err);
        return res.status(500).send("Server error");
    }
}
