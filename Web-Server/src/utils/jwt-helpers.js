const jwt = require('jsonwebtoken');

// jwt secrets for initial token and refresh tokens
// NOTE: Override these via environment variables in production.
const jwtconfig = {
    access: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'reallysecretaccesssecret',
    refresh: process.env.JWT_REFRESH_SECRET || 'reallysecretrefreshsecret',
};

// store for refresh tokens created
const refreshTokens = [];

/**
 * expireIn is an object that can be a string or number in seconds
 *
 * usage: {@link https://www.npmjs.com/package/jsonwebtoken}
 *
 * example:
 *  { expiresIn: 86400 } for 24 hours in seconds
 */
// create a new auth token
const generateAccessToken = (id, expiresIn) => {
    const options = {
        algorithm: 'HS256',
        ...(expiresIn || {}),
    };
    return jwt.sign({
        id
    }, jwtconfig.access, options);
};

// create a new re-auth token
const generateRefreshToken = (id, expiresIn) => {
    const options = {
        algorithm: 'HS256',
        ...(expiresIn || {}),
    };
    return jwt.sign({
        id
    }, jwtconfig.refresh, options);
};

// check token validity
// NOTE: this function should NOT write to the response.
// Callers (middleware/controllers) are responsible for sending the HTTP error.
const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret, {
            algorithms: ['HS256'],
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