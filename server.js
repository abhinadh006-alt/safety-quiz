// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// load webhook handler (same file works as vcerel serverless too)
import webhookHandler from "./api/webhook/safetyhook_92jfks83.js";

// Telegram webhook endpoint - must be POSTed to by Telegram
app.post("/api/webhook/safetyhook_92jfks83", webhookHandler);

// simple health check
app.get("/", (req, res) => res.send("Backend running"));

// PORT comes from env or fallback to 3100
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
    console.log(`Local server running on http://localhost:${PORT}`);
});
