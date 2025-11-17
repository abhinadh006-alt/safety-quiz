// api/profile.js
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

export default function handler(req, res) {
    try {
        const cookies = req.headers.cookie || "";
        const match = cookies.match(/token=([^;]+)/);
        if (!match) return res.status(401).json({ ok: false, error: "no token" });

        const token = match[1];
        const payload = jwt.verify(token, JWT_SECRET);
        return res.status(200).json({ ok: true, profile: payload });
    } catch (err) {
        return res.status(401).json({ ok: false, error: "invalid token", details: String(err) });
    }
}
