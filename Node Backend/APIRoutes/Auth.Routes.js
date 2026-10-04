const router = require('express').Router();
const { getConfig, googleLogin, getSession, logout } = require('../Functions/Auth.Function');

router.get('/config', (req, res) => {
    return getConfig(res);
});

router.post('/google', (req, res) => {
    return googleLogin(req, res);
});

router.get('/me', (req, res) => {
    return getSession(req, res);
});

router.post('/logout', (req, res) => {
    return logout(res);
});

module.exports = router;
