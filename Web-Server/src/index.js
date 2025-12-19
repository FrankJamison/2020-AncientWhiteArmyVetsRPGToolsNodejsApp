// Load local environment variables from .env (no-op if dotenv isn't installed).
// In production, prefer setting real env vars via your host's config.
try {
    require('dotenv').config();
} catch (e) {
    // ignore
}

const express = require('express');
const path = require('path');
const cors = require('cors');
const logger = require('morgan');
const bodyParser = require('body-parser');
let crypto;
try {
    crypto = require('crypto');
} catch (e) {
    crypto = null;
}

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
const appVersion = process.env.APP_VERSION || 'web-server-v2-2025-12-19';

app.disable('etag');
app.set('etag', false);

const _newRequestId = () => {
    try {
        if (crypto && crypto.randomUUID) return crypto.randomUUID();
        if (crypto && crypto.randomBytes) return crypto.randomBytes(16).toString('hex');
    } catch (e) {
        // ignore
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

// Serve the static front-end (Application/public) from this API server.
// This allows a single Node process to host both the site and the /api/* endpoints.
const publicDir = path.resolve(__dirname, '..', '..', 'Application', 'public');

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

// Attach ids + version for debugging and to detect cached responses.
app.use((req, res, next) => {
    const requestId = _newRequestId();
    res.locals.requestId = requestId;
    res.setHeader('X-Response-Id', requestId);
    res.setHeader('X-App-Version', appVersion);
    next();
});

// Discourage edge caching of API responses while troubleshooting.
app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store, max-age=0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    try {
        res.removeHeader('ETag');
    } catch (e) {
        // ignore
    }
    next();
});

// Static front-end
app.use(express.static(publicDir));

// ************************************
// ROUTE-HANDLING MIDDLEWARE FUNCTIONS
// ************************************

// Health check (useful for production diagnostics)
app.get('/health', (req, res) => res.json({
    ok: true,
    service: 'api'
}));

app.get('/__version', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.json({
        ok: true,
        version: appVersion,
        node: process.version
    });
});

app.get('/api/health', (req, res) => res.json({
    ok: true,
    service: 'api'
}));

// Partial API endpoints
app.use('/api/auth', authRoutes); // http://localhost:3000/api/auth
app.use('/api/user', userRoutes); // http://localhost:3000/api/users
app.use('/api/tasks', tasksRoutes); // http://localhost:3000/api/tasks
app.use('/api/characters', characterRoutes);

// Handle 404 requests
app.use(error404);

// Handle 500 requests - applies mostly to live services
app.use(error500);

// listen on server port
app.listen(port, '0.0.0.0', () => {
    console.log(`Running on port: ${port}...`);
});