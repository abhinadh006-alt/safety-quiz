// api/webhook/[token].js
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const APP_URL = process.env.APP_URL || "https://safety-quiz.vercel.app";

if (!BOT_TOKEN) console.error("Missing TELEGRAM_BOT_TOKEN env");

export default async function handler(req, res) {
    // Telegram webhook will POST updates (JSON)
    try {
        const update = req.body;
        // handle message updates
        if (update?.message) {
            const msg = update.message;
            const chatId = msg.chat.id;
            const from = msg.from;
            const text = (msg.text || "").trim();

            // We only respond to /start here for login token generation
            if (text.startsWith("/start")) {
                const userId = from.id;

                // Check channel membership before generating token
                const check = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${encodeURIComponent(CHANNEL_ID)}&user_id=${userId}`);
                const checkJson = await check.json();

                if (!checkJson.ok) {
                    // Could not check membership (invalid chat id etc.)
                    await sendMessage(chatId, `Sorry, I couldn't verify your membership. Please contact admin.`);
                    return res.status(200).json({ ok: false, info: 'chatmember check failed' });
                }

                const status = checkJson.result?.status || "";
                const allowed = ["member", "administrator", "creator"].includes(status);

                if (!allowed) {
                    // Ask user to join channel (provide invite link or channel username)
                    const channelRef = CHANNEL_ID.startsWith("@") ? CHANNEL_ID : "your channel";
                    await sendMessage(chatId, `You must join ${channelRef} to access the quiz. Please join and then send /start again.`);
                    return res.status(200).json({ ok: true, message: 'not member' });
                }

                // Generate short-lived login JWT (15 minutes)
                const loginToken = jwt.sign(
                    { sub: String(userId), username: from.username || null },
                    JWT_SECRET,
                    { algorithm: "HS256", expiresIn: "15m" }
                );

                const loginUrl = `${APP_URL}/auth?token=${encodeURIComponent(loginToken)}`;

                // Send the login link to the user (private)
                const message = `Hello ${from.first_name || ""} — click this link to sign in to the Safety Quiz (valid 15 minutes):\n\n${loginUrl}\n\nIf you did not request this, ignore this message.`;
                await sendMessage(chatId, message);

                return res.status(200).json({ ok: true });
            }

            // other commands handling (optional)
            if (text.startsWith("/help")) {
                await sendMessage(chatId, "Send /start to receive a login link if you are a channel member.");
                return res.status(200).json({ ok: true });
            }
        }

        // default
        return res.status(200).json({ ok: true, skip: true });
    } catch (err) {
        console.error("webhook error:", err);
        return res.status(500).json({ ok: false, error: String(err) });
    }
}

// helper to send messages
async function sendMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const body = { chat_id: chatId, text, disable_web_page_preview: true };
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
