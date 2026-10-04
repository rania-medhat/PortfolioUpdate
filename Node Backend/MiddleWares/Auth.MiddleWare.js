const crypto = require('crypto');

const COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function getSecret() {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error('SESSION_SECRET must be set (at least 32 characters)');
    }
    return secret;
}

function sign(value) {
    return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function isAdminEmail(email) {
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    return Boolean(adminEmail) && String(email || '').toLowerCase() === adminEmail;
}

// COOKIE_SAME_SITE: "lax" (default) when frontend and API share a root domain,
// "none" when they are cross-site (e.g. *.vercel.app + a separate API domain).
function cookieSameSite() {
    const value = (process.env.COOKIE_SAME_SITE || 'lax').trim().toLowerCase();
    if (!['lax', 'strict', 'none'].includes(value)) {
        throw new Error('COOKIE_SAME_SITE must be one of: lax, strict, none');
    }
    return value;
}

function cookieOptions() {
    const sameSite = cookieSameSite();
    return {
        httpOnly: true,
        sameSite,
        // Browsers reject SameSite=None cookies that are not Secure.
        secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
        path: '/',
    };
}

function createSession(res, user) {
    const payload = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + SESSION_TTL_MS })).toString('base64url');
    res.cookie(COOKIE_NAME, `${payload}.${sign(payload)}`, { ...cookieOptions(), maxAge: SESSION_TTL_MS });
}

function clearSession(res) {
    res.clearCookie(COOKIE_NAME, cookieOptions());
}

function readCookie(req, name) {
    const header = req.headers.cookie || '';
    for (const part of header.split(';')) {
        const [key, ...rest] = part.trim().split('=');
        if (key === name) return decodeURIComponent(rest.join('='));
    }
    return null;
}

// Returns the session payload, or null when missing, tampered with, or expired.
function readSession(req) {
    const token = readCookie(req, COOKIE_NAME);
    if (!token) return null;

    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    const expected = Buffer.from(sign(payload));
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) return null;

    try {
        const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        return session.exp > Date.now() ? session : null;
    } catch {
        return null;
    }
}

function requireAdmin(req, res, next) {
    const session = readSession(req);
    if (!session) return res.status(401).json({ message: 'Authentication required' });
    if (!isAdminEmail(session.email)) return res.status(403).json({ message: 'Admin access only' });
    req.admin = session;
    next();
}

module.exports = { cookieSameSite, requireAdmin, readSession, createSession, clearSession, isAdminEmail };
