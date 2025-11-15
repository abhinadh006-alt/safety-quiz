// netlify/functions/verify-telegram.js
const crypto = require('crypto');
const fetch = require('node-fetch'); // Netlify node 18+, may be global; include if needed
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // set in Netlify env vars
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID; // e.g. @yourchannel or -1001234567890
const JWT_SECRET = process.env.JWT_SECRET || 'change_me_for_prod';

function verifyTelegramAuth(data) {
    // data = the object received from the widget (contains hash and fields)
    const hash = data.hash;
    const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
    // construct data-check-string (sorted keys except 'hash')
    const pairs = [];
    Object.keys(data).sort().forEach(k => {
        if (k === 'hash') return;
        pairs.push(`${k}=${data[k]}`);
    });
    const data_check_string = pairs.join('\n');
    const hmac = crypto.createHmac('sha256', secretKey).update(data_check_string).digest('hex');
    return hmac === hash;
}

function signToken(payload) {
    // very simple token (not production JWT). Use a proper JWT lib in production.
    // But Netlify supports installing libraries; for clarity we do a simple HMAC token.
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${sig}`;
}

exports.handler = async function (event) {
    try {
        if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
        const body = JSON.parse(event.body);

        if (!BOT_TOKEN || !CHANNEL_ID) {
            return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Server not configured' }) };
        }

        // verify widget payload integrity
        const ok = verifyTelegramAuth(body);
        if (!ok) return { statusCode: 401, body: JSON.stringify({ ok: false, error: 'Invalid auth signature' }) };

        const user_id = body.id;
        // call getChatMember
        const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${encodeURIComponent(CHANNEL_ID)}&user_id=${user_id}`);
        const json = await resp.json();
        // json.result.status might be 'member', 'creator', 'administrator', 'left', 'kicked'
        if (!json.ok) return { statusCode: 403, body: JSON.stringify({ ok: false, error: 'telegram api error' }) };
        const status = json.result.status;
        const allowed = ['creator', 'administrator', 'member'].includes(status);
        if (!allowed) return { statusCode: 403, body: JSON.stringify({ ok: false, error: 'not a channel member' }) };

        // success: sign a token for client
        const token = signToken({ id: user_id, username: body.username, first_name: body.first_name, exp: Date.now() + 1000 * 60 * 60 * 24 });
        return { statusCode: 200, body: JSON.stringify({ ok: true, token }) };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'server error' }) };
    }
};
