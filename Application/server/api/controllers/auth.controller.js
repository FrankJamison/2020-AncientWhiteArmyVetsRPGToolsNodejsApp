const bcrypt = require('bcryptjs');

const connection = require('../db-config');
const {
    GET_ME_BY_USERNAME,
    GET_ME_BY_USERNAME_WITH_PASSWORD,
    INSERT_NEW_USER,
} = require('../queries/user.queries');
const query = require('../utils/query');
const {
    refreshTokens,
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    jwtconfig,
} = require('../utils/jwt-helpers');

const logDbError = (context, err) => {
    const code = err && err.code ? err.code : undefined;
    const errno = err && err.errno ? err.errno : undefined;
    const message = err && err.message ? err.message : String(err);
    console.error(`[auth] ${context} failed`, {
        code,
        errno,
        message,
    });
};

const normalizeBool = (val) => {
    if (val === true) return true;
    if (val === false) return false;
    if (val === undefined || val === null) return false;
    const s = String(val).trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes' || s === 'y' || s === 'on';
};

const errorCodeForDbError = (err) => {
    const code = err && err.code ? String(err.code) : '';
    const msg = err && err.message ? String(err.message) : '';

    if (code === 'ER_ACCESS_DENIED_ERROR' || code === 'ER_DBACCESS_DENIED_ERROR') return 'DB_ACCESS_DENIED';
    if (code === 'ER_BAD_DB_ERROR') return 'DB_BAD_DATABASE';
    if (code === 'ER_NO_SUCH_TABLE') return 'DB_SCHEMA_MISSING';
    if (code === 'ER_DUP_ENTRY') return 'DB_DUPLICATE';
    if (code === 'ETIMEDOUT' || code === 'ESOCKETTIMEDOUT') return 'DB_TIMEOUT';
    if (code === 'ECONNREFUSED') return 'DB_CONN_REFUSED';
    if (code === 'ENOTFOUND') return 'DB_HOST_NOT_FOUND';
    if (code === 'PROTOCOL_CONNECTION_LOST') return 'DB_CONN_LOST';
    if (code === 'HANDSHAKE_SSL_ERROR') return 'DB_SSL_ERROR';

    // db-config throws a plain Error for missing host; don't leak env var names, just categorize.
    if (msg.toLowerCase().includes('missing db_host') || msg.toLowerCase().includes('missing app_db_host')) {
        return 'MISSING_DB_HOST';
    }

    // If you explicitly want more detail in responses, set EXPOSE_API_ERROR_CODE_DETAILS=true
    // (still no raw DB message; just the driver code).
    if (normalizeBool(process.env.EXPOSE_API_ERROR_CODE_DETAILS) && code) {
        return `DB_${code}`;
    }

    return 'DB_ERROR';
};

exports.register = async (req, res) => {
    try {
        const {
            username,
            email,
            password
        } = req.body || {};

        if (!username || !email || !password) {
            return res
                .status(400)
                .send({
                    msg: 'Username, email, and password are required.'
                });
        }

        // params setup
        const passwordHash = bcrypt.hashSync(password, 10);
        const params = [username, email, passwordHash];

        // establish a connection
        let con;
        try {
            con = await connection();
        } catch (err) {
            logDbError('db connection (register)', err);
            return res
                .status(500)
                .send({
                    msg: 'Database connection failed. Please try again later.',
                    error_code: errorCodeForDbError(err),
                });
        }

        // check for existing user first
        let user;
        try {
            user = await query(con, GET_ME_BY_USERNAME, [username]);
        } catch (err) {
            logDbError('query GET_ME_BY_USERNAME (register)', err);
            return res.status(500).send({
                msg: 'Could not retrieve user.',
                error_code: errorCodeForDbError(err),
            });
        }

        // if we get one result back
        if (Array.isArray(user) && user.length === 1) {
            return res.status(403).send({
                msg: 'User already exists!'
            });
        }

        // add new user
        try {
            await query(con, INSERT_NEW_USER, params);
        } catch (err) {
            if (err && err.code === 'ER_DUP_ENTRY') {
                return res.status(409).send({
                    msg: 'User already exists!'
                });
            }
            logDbError('query INSERT_NEW_USER (register)', err);
            return res
                .status(500)
                .send({
                    msg: 'Could not register user. Please try again later.',
                    error_code: errorCodeForDbError(err),
                });
        }

        return res.status(201).send({
            msg: 'New user created!'
        });
    } catch (err) {
        return res
            .status(500)
            .send({
                msg: 'Could not register user. Please try again later.'
            });
    }
};

exports.login = async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body || {};

        if (!username || !password) {
            return res.status(400).send({
                msg: 'Username and password are required.'
            });
        }

        let con;
        try {
            con = await connection();
        } catch (err) {
            return res.status(500).send({
                msg: 'Database connection failed. Please try again later.'
            });
        }

        let user;
        try {
            user = await query(con, GET_ME_BY_USERNAME_WITH_PASSWORD, [username]);
        } catch (err) {
            return res.status(500).send({
                msg: 'Could not retrieve user.'
            });
        }

        if (!Array.isArray(user) || user.length !== 1) {
            return res.status(400).send({
                msg: 'Invalid username or password.'
            });
        }

        let validPass;
        try {
            validPass = await bcrypt.compare(password, user[0].password);
        } catch (err) {
            return res.status(500).send({
                msg: 'Could not validate password.'
            });
        }

        if (!validPass) {
            return res.status(400).send({
                msg: 'Invalid username or password.'
            });
        }

        const accessToken = generateAccessToken(user[0].user_id, {
            expiresIn: 86400,
        });
        const refreshToken = generateRefreshToken(user[0].user_id, {
            expiresIn: 86400,
        });

        refreshTokens.push(refreshToken);

        return res
            .header('access_token', accessToken)
            .send({
                auth: true,
                msg: 'Logged in!',
                token_type: 'bearer',
                access_token: accessToken,
                expires_in: 86400,
                refresh_token: refreshToken,
            });
    } catch (err) {
        return res.status(500).send({
            msg: 'Could not login. Please try again later.'
        });
    }
};

exports.token = (req, res) => {
    const refreshToken = req.body.token;

    // stop user auth validation if no token provided
    if (!refreshToken) {
        return res
            .status(401)
            .send({
                auth: false,
                msg: 'Access Denied. No token provided.'
            });
    }

    // stop refresh is refresh token invalid
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403).send({
            msg: 'Invalid Refresh Token'
        });
    }

    try {
        const verified = verifyToken(refreshToken, jwtconfig.refresh); // { id, iat, exp }
        const accessToken = generateAccessToken(verified.id, {
            expiresIn: 86400
        });

        return res
            .header('access_token', accessToken)
            .send({
                auth: true,
                msg: 'Logged in!',
                token_type: 'bearer',
                access_token: accessToken,
                expires_in: 86400,
                refresh_token: refreshToken,
            });
    } catch (err) {
        return res.status(403).send({
            msg: 'Invalid Token'
        });
    }
};

exports.logout = (req, res) => {
    const refreshToken = req.body.token;
    const idx = refreshTokens.indexOf(refreshToken);
    if (idx !== -1) refreshTokens.splice(idx, 1);

    res.send({
        msg: 'Logout successful'
    });
};