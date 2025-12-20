// Load local environment variables from .env (no-op if dotenv isn't installed).
// In production, prefer setting real env vars via your host's config.
try {
    require('dotenv').config();
} catch (e) {
    // ignore
}

const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const tasksRoutes = require('./routes/tasks.routes');
const characterRoutes = require('./routes/character.routes');
const {
    error404,
    error500
} = require('./middleware/errors.middleware');

const app = express();
const port = process.env.PORT || 3001;
const logLevel = process.env.LOG_LEVEL || 'dev';
const env = process.env.NODE_ENV;

// Debug-friendly headers + endpoint to verify which build is deployed and whether env vars exist.
// Safe: does not expose secrets.
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

    res.setHeader('x-env-has-db-host', (hasEnv('DB_HOST') || hasEnv('APP_DB_HOST') || hasEnv('MYSQL_HOST') || hasEnv('DB_HOSTNAME')) ? '1' : '0');
    res.setHeader('x-env-has-db-user', (hasEnv('DB_USER') || hasEnv('DB_USERNAME') || hasEnv('MYSQL_USER')) ? '1' : '0');
    res.setHeader('x-env-has-db-pass', (hasEnv('DB_PASS') || hasEnv('DB_PASSWORD') || hasEnv('MYSQL_PASSWORD')) ? '1' : '0');
    res.setHeader('x-env-has-db-name', (hasEnv('DB_DATABASE') || hasEnv('DB_NAME') || hasEnv('MYSQL_DATABASE')) ? '1' : '0');
    res.setHeader('x-env-has-db-port', hasEnv('DB_PORT') ? '1' : '0');

    next();
});

app.get('/api/_diag', (req, res) => {
    const hasEnv = (name) => {
        const val = process.env[name];
        return val !== undefined && val !== null && String(val).trim() !== '';
    };

    res.json({
        app_build: process.env.APP_BUILD || null,
        node_env: process.env.NODE_ENV || null,
        env: {
            has_db_host: (hasEnv('DB_HOST') || hasEnv('APP_DB_HOST') || hasEnv('MYSQL_HOST') || hasEnv('DB_HOSTNAME')),
            has_db_user: (hasEnv('DB_USER') || hasEnv('DB_USERNAME') || hasEnv('MYSQL_USER')),
            has_db_pass: (hasEnv('DB_PASS') || hasEnv('DB_PASSWORD') || hasEnv('MYSQL_PASSWORD')),
            has_db_name: (hasEnv('DB_DATABASE') || hasEnv('DB_NAME') || hasEnv('MYSQL_DATABASE')),
            has_db_port: hasEnv('DB_PORT'),
        },
    });
});

// Serve the frontend from the same origin as the API.
// This allows production to use https://www.ancientwhitearmyvet.com/api for API calls.
const staticRoot = path.join(__dirname, '../../Application/public');
app.use(express.static(staticRoot));

// Middleware - logs server requests to console
if (env !== 'test') {
    app.use(logger(logLevel));
}

// Middleware - parses incoming requests data (https://github.com/expresssrc/body-parser)
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Allow websites to talk to our API service.
app.use(cors());

// ************************************
// ROUTE-HANDLING MIDDLEWARE FUNCTIONS
// ************************************

// Partial API endpoints
app.use('/api/auth', authRoutes); // /api/auth
app.use('/api/user', userRoutes); // /api/user
app.use('/api/tasks', tasksRoutes); // /api/tasks
app.use('/api/characters', characterRoutes);

// Handle 404 requests
app.use(error404);

// Handle 500 requests - applies mostly to live services
app.use(error500);

// listen on server port
app.listen(port, () => {
    console.log(`Running on port: ${port}...`);
});