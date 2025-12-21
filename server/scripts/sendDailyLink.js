import fetch from "node-fetch";
import { getTodayAccessLink } from "../utils/dailyLink.js";

const link = getTodayAccessLink();

const message = `
🛡️ Safety Quiz – Daily Access

🔗 ${link}

⏰ Valid only for today
❌ Old links will not work
`;

await fetch(
    `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to: process.env.WHATSAPP_GROUP_ID,
            type: "text",
            text: { body: message },
        }),
    }
);

console.log("Daily access link sent to WhatsApp");
