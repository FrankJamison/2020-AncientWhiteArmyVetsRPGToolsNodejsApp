const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

// Load local environment variables from .env (no-op if dotenv isn't installed).
// In production, prefer setting real env vars via Hostinger Environment Variables.
try {
    require('dotenv').config();
} catch (e) {
    // ignore
}

const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');

const port = process.env.PORT || 4000;
const logLevel = process.env.LOG_LEVEL || 'dev';
const env = process.env.NODE_ENV;

// Some hosts don't expose app logs. Write a small log file you can read from the file manager.
const logPath = process.env.APP_LOG_PATH
    ? path.resolve(process.env.APP_LOG_PATH)
    : path.join(process.cwd(), 'app.log');

const logLine = (msg) => {
    try {
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
    } catch (e) {
        // ignore
    }
};

// Many shared hosts hide stdout/stderr. Mirror console output into app.log.
// Keep this lightweight and safe (truncate long lines).
(() => {
    const orig = {
        log: console.log.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
    };

    const toLine = (args) => {
        try {
            const parts = args.map((a) => {
                if (a instanceof Error) return a.stack || a.message;
                if (typeof a === 'string') return a;
                try {
                    return JSON.stringify(a);
                } catch (e) {
                    return String(a);
                }
            });
            const line = parts.join(' ');
            return line.length > 2000 ? `${line.slice(0, 2000)}…` : line;
        } catch (e) {
            return '<<unprintable log line>>';
        }
    };

    console.log = (...args) => {
        orig.log(...args);
        logLine(`log: ${toLine(args)}`);
    };
    console.warn = (...args) => {
        orig.warn(...args);
        logLine(`warn: ${toLine(args)}`);
    };
    console.error = (...args) => {
        orig.error(...args);
        logLine(`error: ${toLine(args)}`);
    };
})();

process.on('uncaughtException', (err) => {
    logLine(`uncaughtException: ${err && err.stack ? err.stack : String(err)}`);
});

process.on('unhandledRejection', (err) => {
    logLine(`unhandledRejection: ${err && err.stack ? err.stack : String(err)}`);
});

// Resolve static path regardless of current working directory.
const publicDir = path.resolve(__dirname, '..', 'public');
logLine(`boot: publicDir=${publicDir}`);
logLine(`boot: port=${port}`);
logLine(`boot: node=${process.version}`);
logLine(`boot: cwd=${process.cwd()}`);

// Middleware
if (env !== 'test') {
    try {
        app.use(logger(logLevel));
    } catch (e) {
        // ignore
    }
}

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cors());

// API routes (vendored under Application/ so Hostinger can deploy only this folder)
const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/user.routes');
const tasksRoutes = require('./api/routes/tasks.routes');
const characterRoutes = require('./api/routes/character.routes');
const { error404, error500 } = require('./api/middleware/errors.middleware');

app.get('/health', (req, res) => res.json({ ok: true }));

// Avoid noisy 404s in browser console.
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'api' }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/characters', characterRoutes);

// Diagnostics endpoint for hosts that don't provide server logs/file access.
// Enabled only when DIAGNOSTICS_KEY is set.
app.get('/__diag', (req, res) => {
    const diagnosticsKey = process.env.DIAGNOSTICS_KEY;
    if (!diagnosticsKey) return res.status(404).end();

    const provided = req.query.key || req.headers['x-diagnostics-key'];
    if (!provided || String(provided) !== String(diagnosticsKey)) {
        return res.status(403).json({ ok: false, msg: 'Forbidden' });
    }

    const safeRead = (p) => {
        try {
            if (!fs.existsSync(p)) return null;
            return fs.readFileSync(p, 'utf8');
        } catch (e) {
            return null;
        }
    };

    const installOk = safeRead(path.join(process.cwd(), 'install.ok'));
    const startOk = safeRead(path.join(process.cwd(), 'start.ok'));
    const appLog = safeRead(logPath);

    return res.json({
        ok: true,
        node: process.version,
        cwd: process.cwd(),
        publicDir,
        port,
        installOk: installOk ? installOk.trim() : null,
        startOk: startOk ? startOk.trim() : null,
        appLogTail: appLog ? String(appLog).slice(-4000) : null,
    });
});

app.use(express.static(publicDir));

app.use('/css', express.static(path.join(publicDir, 'css')));
app.use('/js', express.static(path.join(publicDir, 'src')));
app.use('/pdf', express.static(path.join(publicDir, 'pdf')));
app.use('/images', express.static(path.join(publicDir, 'images')));
app.use('/lib', express.static(path.join(publicDir, 'lib')));
app.use('/characters', express.static(path.join(publicDir, 'characters')));
app.use('/src', express.static(path.join(publicDir, 'src')));

// API error handling (kept consistent with Web-Server)
app.use(error404);
app.use(error500);

app.listen(port, '0.0.0.0', function () {
    console.log('Server started at http://localhost:%s', port);
    logLine(`listening: http://localhost:${port}`);
});