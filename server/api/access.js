import express from "express";
import jwt from "jsonwebtoken";
import { getTodayToken } from "../utils/dailyToken.js";

const router = express.Router();

router.post("/api/access/validate", (req, res) => {
    const { access } = req.body;

    if (!access) {
        return res.status(401).json({ ok: false });
    }

    const todayToken = getTodayToken();

    if (access !== todayToken) {
        return res.status(401).json({ ok: false });
    }

    const token = jwt.sign(
        { channel: "daily-link" },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );

    res.setHeader(
        "Set-Cookie",
        `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
    );

    return res.json({ ok: true });
});

export default router;
