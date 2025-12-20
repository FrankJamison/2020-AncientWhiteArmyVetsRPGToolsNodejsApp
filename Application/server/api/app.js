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