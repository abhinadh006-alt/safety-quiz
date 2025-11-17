// api/webhook/[token].js
// Minimal Vercel webhook for Telegram.
// - URL: /api/webhook/<BOT_TOKEN>
// - Validates the token from URL against process.env.TELEGRAM_BOT_TOKEN
// - Always returns 200 quickly (so Telegram stops retrying).
// - Optional: replies to the user with a short echo (safe for testing).

export default async function handler(req, res) {
    // Only POST updates from Telegram are important; reply OK for others
    if (req.method !== "POST") {
        return res.status(200).send("OK");
    }

    try {
        const urlToken = req.query.token; // from /api/webhook/<token>
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

        if (!BOT_TOKEN) {
            console.error("TELEGRAM_BOT_TOKEN missing in env");
            return res.status(500).json({ ok: false, error: "server misconfigured" });
        }

        if (!urlToken || urlToken !== BOT_TOKEN) {
            console.warn("Webhook token mismatch", { urlTokenPresent: !!urlToken });
            return res.status(401).json({ ok: false, error: "unauthorized" });
        }

        // Telegram sends JSON update in body; Vercel parses JSON into req.body
        const update = req.body;
        // Quick log (visible in Vercel function logs)
        console.log("Incoming Telegram update:", JSON.stringify(update).slice(0, 2000));

        // If it's a message, optionally reply with an acknowledgement (remove in prod)
        if (update && update.message && update.message.chat && update.message.chat.id) {
            const chatId = update.message.chat.id;
            const text = update.message.text || "";

            // Optional: reply (comment out if you don't want auto-replies)
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `Received your message (for testing): ${text.substring(0, 150)}`
                })
            });
        }

        // IMPORTANT: respond 200 quickly so Telegram marks the update delivered
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("Webhook handler error:", err);
        return res.status(500).json({ ok: false, error: "server error" });
    }
}
