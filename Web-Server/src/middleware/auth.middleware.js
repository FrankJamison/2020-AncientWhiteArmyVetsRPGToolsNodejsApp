const {
    jwtconfig,
    verifyToken
} = require('../utils/jwt-helpers');

module.exports = (req, res, next) => {
    const authHeader = req.headers['auth-token'] || req.headers['authorization'];

    // undefined === false
    if (!authHeader) {
        // stop user auth validation
        return res
            .status(401)
            .json({
                auth: false,
                msg: 'Access Denied. No token provided.'
            });
    }

    const accessToken = authHeader.split(' ')[1];

    try {
        // verify the token is correct
        const user = verifyToken(accessToken, jwtconfig.access); // {id: 1, iat: ..., exp: ...}
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({
            msg: 'Invalid Token'
        });
    }
};