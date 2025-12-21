export default function handler(req, res) {
    const token = req.query.token;
    if (!token) {
        return res.status(400).send("Missing token");
    }

    // Redirect to WhatsApp auth handler
    return res.redirect(`/api/auth-whatsapp?token=${encodeURIComponent(token)}`);
}
