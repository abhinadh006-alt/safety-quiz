import { getTodayToken } from "../utils/dailyToken.js";

export function requireDailyAccess(req, res, next) {
    const token = req.query.access;

    if (!token) {
        return res.redirect("/blocked");
    }

    const todayToken = getTodayToken();

    if (token !== todayToken) {
        return res.redirect("/blocked");
    }

    // Valid access → continue
    next();
}
