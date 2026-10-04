const { OAuth2Client } = require('google-auth-library');
const { createSession, clearSession, readSession, isAdminEmail } = require('../MiddleWares/Auth.MiddleWare');

const googleClient = new OAuth2Client();

function getConfig(res) {
    res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || null });
}

async function googleLogin(req, res) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(503).json({ message: 'Google login is not configured' });

    const credential = req.body?.credential;
    if (typeof credential !== 'string' || !credential) {
        return res.status(400).json({ message: 'Missing Google credential' });
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
        payload = ticket.getPayload();
    } catch {
        return res.status(401).json({ message: 'Invalid Google credential' });
    }

    if (!payload?.email_verified || !isAdminEmail(payload.email)) {
        return res.status(403).json({ message: 'This Google account is not allowed to access the dashboard' });
    }

    const admin = { email: payload.email, name: payload.name, picture: payload.picture };
    createSession(res, admin);
    res.json(admin);
}

// Session check: "not logged in" is a normal state here (204), not an error. Admin APIs still return 401/403.
function getSession(req, res) {
    const session = readSession(req);
    if (!session || !isAdminEmail(session.email)) return res.status(204).end();
    const { email, name, picture } = session;
    res.json({ email, name, picture });
}

function logout(res) {
    clearSession(res);
    res.status(204).end();
}

module.exports = { getConfig, googleLogin, getSession, logout };
