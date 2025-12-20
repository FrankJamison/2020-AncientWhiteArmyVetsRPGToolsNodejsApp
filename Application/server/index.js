const express = require('express');
const path = require('path');

const apiApp = require('./api/app');

const app = express();
const port = process.env.PORT || 3001;

// Prevent CDN/proxy caching of API responses.
app.use((req, res, next) => {
    if (req.path && String(req.path).startsWith('/api')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
    }
    next();
});

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

// Serve the static frontend pages
const staticRoot = path.join(__dirname, '../public');
app.use(express.static(staticRoot));

// Serve the API from the same origin
app.use(apiApp);

app.listen(port, () => {
    console.log('Running on port: %s', port);
});