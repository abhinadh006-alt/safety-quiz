export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(200).json({ message: "Webhook working" });
    }

    console.log("Received update:", req.body);

    const message = req?.body?.message?.text;

    if (message === "/start") {
        await fetch(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: req.body.message.chat.id,
                    text: "Welcome! Your bot is now working!",
                }),
            }
        );
    }

    return res.status(200).send("OK");
}
