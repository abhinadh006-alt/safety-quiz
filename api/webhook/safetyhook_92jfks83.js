// api/webhook/safetyhook_92jfks83.js
// This file works as:
//  - an Express middleware (imported in server.js), or
//  - a Vercel serverless function (export default)
export default async function webhookHandler(req, res) {
    // Telegram sends POST JSON updates. For browser GETs, show a helpful message.
    if (req.method !== "POST") {
        return res.status(200).json({ message: "Telegram webhook endpoint (POST only)" });
    }

    try {
        // Log the update for debugging (ngrok console + server logs)
        console.log("Received update:", JSON.stringify(req.body, null, 2));

        const text = req.body?.message?.text;
        const chatId = req.body?.message?.chat?.id;

        // Basic guard: require bot token in env
        // at top of file
        const DISABLE_TELEGRAM = (process.env.DISABLE_TELEGRAM === 'true');
        // later where you check BOT token:
        const BOT = process.env.TELEGRAM_BOT_TOKEN;
        if (!BOT && !DISABLE_TELEGRAM) {
            console.error("TELEGRAM_BOT_TOKEN not set in env");
            return res.status(500).json({ ok: false, error: "Missing bot token" });
        }


        // Only respond to /start for now
        if (text && text.trim() === "/start" && chatId) {
            const url = `https://api.telegram.org/bot${BOT}/sendMessage`;
            try {
                await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: "Welcome! Your bot is now working!",
                    }),
                });
            } catch (err) {
                console.error("Error sending message to Telegram:", err);
            }
        }

        // Always respond 200 quickly to Telegram
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("Webhook handler error:", err);
        return res.status(500).json({ ok: false, error: String(err) });
    }
}
