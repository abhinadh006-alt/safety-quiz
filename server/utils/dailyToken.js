import crypto from "crypto";

export function getTodayToken() {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const secret = process.env.DAILY_ACCESS_SECRET;

    return crypto
        .createHmac("sha256", secret)
        .update(today)
        .digest("hex");
}
