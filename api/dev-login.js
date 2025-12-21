import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export default function handler(req, res) {
    try {
        const token = jwt.sign(
            { sub: "dev-user", channel: "dev" },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.setHeader("Set-Cookie", [
            `token=${token}`,
            "Path=/",
            "HttpOnly",
            "SameSite=Lax",
            "Domain=localhost"
        ].join("; "));

        return res.json({ ok: true });
    } catch (err) {
        console.error("dev-login error:", err);
        return res.status(500).json({ ok: false });
    }
}
