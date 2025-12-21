import { getTodayToken } from "../utils/dailyToken.js";

const token = getTodayToken();

console.log(
    `https://your-domain.com/?access=${token}`
);
