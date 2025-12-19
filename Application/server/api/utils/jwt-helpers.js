const jwt = require('jsonwebtoken');

// NOTE: Override these via environment variables in production.
const jwtconfig = {
    access: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'reallysecretaccesssecret',
    refresh: process.env.JWT_REFRESH_SECRET || 'reallysecretrefreshsecret',
};

const refreshTokens = [];

const generateAccessToken = (id, expiresIn) => {
    const options = {
        algorithm: 'HS256',
        ...(expiresIn || {}),
    };
    return jwt.sign({
        id
    }, jwtconfig.access, options);
};

const generateRefreshToken = (id, expiresIn) => {
    const options = {
        algorithm: 'HS256',
        ...(expiresIn || {}),
    };
    return jwt.sign({
        id
    }, jwtconfig.refresh, options);
};

const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret, {
            algorithms: ['HS256']
        });
    } catch (err) {
        const e = new Error('Invalid token');
        e.name = 'InvalidTokenError';
        e.cause = err;
        throw e;
    }
};

module.exports = {
    jwtconfig,
    refreshTokens,
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
};