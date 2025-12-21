import { getTodayToken } from "./dailyToken.js";

export function getTodayAccessLink() {
    const token = getTodayToken();
    return `${process.env.APP_URL}/?access=${token}`;
}
