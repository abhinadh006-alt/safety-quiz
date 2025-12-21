import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

export default function handler(req, res) {
    const cookies = req.headers.cookie || "";
    const match = cookies.match(/token=([^;]+)/);

    if (!match) return res.status(401).json({ ok: false });

    try {
        const token = match[1];
        const payload = jwt.verify(token, JWT_SECRET);
        res.json({ ok: true, profile: payload });
    } catch (e) {
        res.status(401).json({ ok: false, error: e.message });
    }
}
