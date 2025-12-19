const {
    jwtconfig,
    verifyToken
} = require('../utils/jwt-helpers');

module.exports = (req, res, next) => {
    const authHeader = req.headers['auth-token'] || req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({
            auth: false,
            msg: 'Access Denied. No token provided.',
        });
    }

    const accessToken = authHeader.split(' ')[1];

    try {
        const user = verifyToken(accessToken, jwtconfig.access);
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({
            msg: 'Invalid Token',
        });
    }
};