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

const _errInfo = (err) => ({
    code: err && err.code,
    errno: err && err.errno,
    message: err && err.message,
});

exports.register = async (req, res) => {
    try {
        const {
            username,
            email,
            password
        } = req.body || {};

        if (!username || !email || !password) {
            return res.status(400).send({
                msg: 'Username, email, and password are required.',
            });
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        const params = [username, email, passwordHash];

        let con;
        try {
            con = await connection();
        } catch (err) {
            console.error('auth.register: DB connection failed', {
                code: err && err.code,
                errno: err && err.errno,
                message: err && err.message,
            });
            return res.status(500).send({
                msg: 'Database connection failed. Please try again later.',
                error_code: err && err.code ? String(err.code) : undefined,
            });
        }

        let user;
        try {
            user = await query(con, GET_ME_BY_USERNAME, [username]);
        } catch (err) {
            console.error('auth.register: GET_ME_BY_USERNAME failed', _errInfo(err));
            return res.status(500).send({
                msg: 'Could not retrieve user.',
                error_code: err && err.code ? String(err.code) : undefined,
            });
        }

        if (Array.isArray(user) && user.length === 1) {
            return res.status(403).send({
                msg: 'User already exists!',
            });
        }

        try {
            await query(con, INSERT_NEW_USER, params);
        } catch (err) {
            console.error('auth.register: INSERT_NEW_USER failed', _errInfo(err));
            return res.status(500).send({
                msg: 'Could not register user. Please try again later.',
                error_code: err && err.code ? String(err.code) : undefined,
            });
        }

        return res.status(201).send({
            msg: 'New user created!',
        });
    } catch (err) {
        return res.status(500).send({
            msg: 'Could not register user. Please try again later.',
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
                msg: 'Username and password are required.',
            });
        }

        let con;
        try {
            con = await connection();
        } catch (err) {
            console.error('auth.login: DB connection failed', {
                code: err && err.code,
                errno: err && err.errno,
                message: err && err.message,
            });
            return res.status(500).send({
                msg: 'Database connection failed. Please try again later.',
                error_code: err && err.code ? String(err.code) : undefined,
            });
        }

        let user;
        try {
            user = await query(con, GET_ME_BY_USERNAME_WITH_PASSWORD, [username]);
        } catch (err) {
            console.error('auth.login: GET_ME_BY_USERNAME_WITH_PASSWORD failed', _errInfo(err));
            return res.status(500).send({
                msg: 'Could not retrieve user.',
                error_code: err && err.code ? String(err.code) : undefined,
            });
        }

        if (!Array.isArray(user) || user.length !== 1) {
            return res.status(400).send({
                msg: 'Invalid username or password.',
            });
        }

        let validPass;
        try {
            validPass = await bcrypt.compare(password, user[0].password);
        } catch (err) {
            console.error('auth.login: bcrypt.compare failed', _errInfo(err));
            return res.status(500).send({
                msg: 'Could not validate password.',
                error_code: err && err.code ? String(err.code) : undefined,
            });
        }

        if (!validPass) {
            return res.status(400).send({
                msg: 'Invalid username or password.',
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
            msg: 'Could not login. Please try again later.',
        });
    }
};

exports.token = (req, res) => {
    const refreshToken = req.body.token;

    if (!refreshToken) {
        return res.status(401).send({
            auth: false,
            msg: 'Access Denied. No token provided.',
        });
    }

    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403).send({
            msg: 'Invalid Refresh Token',
        });
    }

    try {
        const verified = verifyToken(refreshToken, jwtconfig.refresh);
        const accessToken = generateAccessToken(verified.id, {
            expiresIn: 86400,
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
            msg: 'Invalid Token',
        });
    }
};

exports.logout = (req, res) => {
    const refreshToken = req.body.token;
    const idx = refreshTokens.indexOf(refreshToken);
    if (idx !== -1) refreshTokens.splice(idx, 1);

    res.send({
        msg: 'Logout successful',
    });
};