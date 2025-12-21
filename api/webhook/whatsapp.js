import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const APP_URL = process.env.APP_URL || "http://localhost:5174";
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// ---------- SAFETY CHECK ----------
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !JWT_SECRET || !ACCESS_TOKEN || !PHONE_ID) {
    console.error("❌ WhatsApp webhook env variables missing");
}

// ---------- WEBHOOK HANDLER ----------
export default async function handler(req, res) {

    // Meta webhook verification (GET)
    if (req.method === "GET") {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            return res.status(200).send(challenge);
        }
        return res.status(403).send("Verification failed");
    }

    // Incoming messages (POST)
    try {
        const entry = req.body?.entry?.[0];
        const change = entry?.changes?.[0];
        const message = change?.value?.messages?.[0];

        if (!message) return res.sendStatus(200);

        // ❗ Ignore non-text messages (images, stickers, etc.)
        if (!message.text || !message.text.body) {
            return res.sendStatus(200);
        }

        const phone = String(message.from);
        const text = message.text.body.trim().toLowerCase();

        // ---------- REGISTER ----------
        if (text === "register") {

            const checkResp = await fetch(
                `${SUPABASE_URL}/rest/v1/whatsapp_users?phone_number=eq.${phone}`,
                {
                    headers: {
                        apikey: SUPABASE_SERVICE_KEY,
                        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
                    }
                }
            );

            const rows = await checkResp.json();

            if (!rows.length) {
                // Insert as PENDING
                const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/whatsapp_users`, {
                    method: "POST",
                    headers: {
                        apikey: SUPABASE_SERVICE_KEY,
                        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        phone_number: phone,
                        status: "pending"
                    })
                });

                if (!insertResp.ok) {
                    console.error("Insert failed:", await insertResp.text());
                }

                await sendWhatsAppMessage(
                    phone,
                    "✅ Registration request received.\nPlease wait for admin approval."
                );
            } else {
                await sendWhatsAppMessage(
                    phone,
                    "ℹ️ You are already registered.\nIf approved, send START."
                );
            }

            return res.sendStatus(200);
        }

        // ---------- START ----------
        if (text === "start") {

            const resp = await fetch(
                `${SUPABASE_URL}/rest/v1/whatsapp_users?phone_number=eq.${phone}`,
                {
                    headers: {
                        apikey: SUPABASE_SERVICE_KEY,
                        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
                    }
                }
            );

            const users = await resp.json();
            const user = users[0];

            if (!user) {
                await sendWhatsAppMessage(
                    phone,
                    "❌ You are not registered.\nPlease send REGISTER first."
                );
                return res.sendStatus(200);
            }

            if (user.status !== "active") {
                await sendWhatsAppMessage(
                    phone,
                    "⏳ Your access is not approved yet.\nPlease contact admin."
                );
                return res.sendStatus(200);
            }

            // Generate login token (15 min)
            const loginToken = jwt.sign(
                { sub: phone, channel: "whatsapp" },
                JWT_SECRET,
                { expiresIn: "15m" }
            );

            const loginUrl = `${APP_URL}/wa-entry?token=${encodeURIComponent(loginToken)}`;

            await sendWhatsAppMessage(
                phone,
                `🛡 Safety Quiz Access\n\nClick below to enter:\n${loginUrl}\n\n(Link valid for 15 minutes)`
            );

            return res.sendStatus(200);
        }

        // Ignore all other messages
        return res.sendStatus(200);

    } catch (err) {
        console.error("WhatsApp webhook error:", err);
        return res.sendStatus(500);
    }
}

// ---------- MESSAGE SENDER ----------
async function sendWhatsAppMessage(to, body) {
    const url = `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`;
    await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            text: { body }
        })
    });
}
