import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const JWT_SECRET = process.env.JWT_SECRET;
const APP_URL = process.env.APP_URL || "http://localhost:5174";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
    try {
        // STEP 1: Read token from URL
        const token = req.query.token;
        if (!token) {
            return res.status(400).send("Missing token");
        }

        // STEP 2: Verify short-lived WhatsApp login token
        const payload = jwt.verify(token, JWT_SECRET);

        if (payload.channel !== "whatsapp") {
            return res.status(403).send("Invalid channel");
        }

        const phoneNumber = payload.sub;

        // STEP 3: Check user in Supabase (must be ACTIVE)
        const checkResp = await fetch(
            `${SUPABASE_URL}/rest/v1/whatsapp_users?phone_number=eq.${phoneNumber}&status=eq.active`,
            {
                headers: {
                    apikey: SUPABASE_SERVICE_KEY,
                    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
                }
            }
        );

        const users = await checkResp.json();

        if (!users.length) {
            return res
                .status(403)
                .send("Access not approved or revoked. Please contact admin.");
        }

        // STEP 4: Update last_login timestamp
        await fetch(
            `${SUPABASE_URL}/rest/v1/whatsapp_users?phone_number=eq.${phoneNumber}`,
            {
                method: "PATCH",
                headers: {
                    apikey: SUPABASE_SERVICE_KEY,
                    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    last_login: new Date().toISOString()
                })
            }
        );

        // STEP 5: Create long-lived session token (7 days)
        const sessionToken = jwt.sign(
            { sub: phoneNumber, channel: "whatsapp" },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // STEP 6: Set secure cookie
        const cookieParts = [
            `token=${sessionToken}`,
            "HttpOnly",
            "Path=/",
            "Max-Age=604800",
            "SameSite=Lax",
            "Domain=localhost"
        ];


        if (process.env.NODE_ENV === "production") {
            cookieParts.push("Secure");
        }

        res.setHeader("Set-Cookie", cookieParts.join("; "));


        // STEP 7: Redirect user into the app
        const redirectTo = `${APP_URL}/quiz/select-category`;
        return res.redirect(302, redirectTo);

    } catch (err) {
        console.error("auth-whatsapp error:", err);
        return res.status(401).send("Invalid or expired link");
    }
}
