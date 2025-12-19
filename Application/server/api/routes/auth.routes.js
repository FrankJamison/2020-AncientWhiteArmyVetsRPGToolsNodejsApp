const express = require('express');
const {
    register,
    login,
    logout,
    token
} = require('../controllers/auth.controller');

const authRoutes = express.Router();

authRoutes.post('/register', register);
// Some CDNs ignore query strings for cache keys. Accept a throwaway path segment
// to guarantee a unique URL and force an origin hit while troubleshooting.
authRoutes.post('/register/:cb', register);
authRoutes.post('/login', login);
authRoutes.post('/login/:cb', login);
authRoutes.post('/token', token);
authRoutes.post('/logout', logout);

module.exports = authRoutes;