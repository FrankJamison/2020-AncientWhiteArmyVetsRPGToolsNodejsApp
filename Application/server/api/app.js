// Load local environment variables from .env (no-op if dotenv isn't installed).
// In production, prefer setting real env vars via your host's config.
let dotenvLoaded = false;
try {
    require('dotenv').config();
    dotenvLoaded = true;
} catch (e) {
    // ignore
}

const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const tasksRoutes = require('./routes/tasks.routes');
const characterRoutes = require('./routes/character.routes');
const {
    error404,
    error500
} = require('./middleware/errors.middleware');

const app = express();
const logLevel = process.env.LOG_LEVEL || 'dev';
const env = process.env.NODE_ENV;

// Debug-friendly headers to confirm which build is deployed (safe: no secrets).
// Set APP_BUILD in your host panel (e.g. a date or git sha).
app.use((req, res, next) => {
    const hasEnv = (name) => {
        const val = process.env[name];
        return val !== undefined && val !== null && String(val).trim() !== '';
    };

    if (process.env.APP_BUILD) {
        res.setHeader('x-app-build', String(process.env.APP_BUILD));
    }
    if (process.env.NODE_ENV) {
        res.setHeader('x-app-env', String(process.env.NODE_ENV));
    }

    // Env presence checks (boolean only; does not reveal values).
    res.setHeader('x-dotenv-loaded', dotenvLoaded ? '1' : '0');
    res.setHeader('x-env-has-db-host', (hasEnv('DB_HOST') || hasEnv('APP_DB_HOST') || hasEnv('MYSQL_HOST') || hasEnv('DB_HOSTNAME')) ? '1' : '0');
    res.setHeader('x-env-has-db-user', (hasEnv('DB_USER') || hasEnv('DB_USERNAME') || hasEnv('MYSQL_USER')) ? '1' : '0');
    res.setHeader('x-env-has-db-pass', (hasEnv('DB_PASS') || hasEnv('DB_PASSWORD') || hasEnv('MYSQL_PASSWORD')) ? '1' : '0');
    res.setHeader('x-env-has-db-name', (hasEnv('DB_DATABASE') || hasEnv('DB_NAME') || hasEnv('MYSQL_DATABASE')) ? '1' : '0');
    res.setHeader('x-env-has-db-port', hasEnv('DB_PORT') ? '1' : '0');
    next();
});

// Middleware - logs server requests to console
if (env !== 'test') {
    app.use(logger(logLevel));
}

// Middleware - parses incoming requests data
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Allow websites to talk to our API service.
app.use(cors());

// Partial API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/characters', characterRoutes);

// Handle 404 requests
app.use(error404);

// Handle 500 requests
app.use(error500);

module.exports = app;