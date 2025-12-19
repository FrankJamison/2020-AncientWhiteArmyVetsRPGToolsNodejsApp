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
const appVersion = process.env.APP_VERSION || 'app-v2-2025-12-19';

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

// Resolve paths regardless of current working directory.
// Repo layout: HTML in Application/public, most assets in Application/*.
const appRootDir = path.resolve(__dirname, '..');
const publicDir = path.join(appRootDir, 'public');

const _pickExistingDir = (preferred, fallback) => {
    try {
        if (preferred && fs.existsSync(preferred) && fs.statSync(preferred).isDirectory()) return preferred;
    } catch (e) {
        // ignore
    }
    return fallback;
};

// Prefer assets under public/* (some hosts move/copy assets there),
// but keep compatibility with the repo layout (Application/*).
const assetsDir = {
    css: _pickExistingDir(path.join(publicDir, 'css'), path.join(appRootDir, 'css')),
    lib: _pickExistingDir(path.join(publicDir, 'lib'), path.join(appRootDir, 'lib')),
    images: _pickExistingDir(path.join(publicDir, 'images'), path.join(appRootDir, 'images')),
    pdf: _pickExistingDir(path.join(publicDir, 'pdf'), path.join(appRootDir, 'pdf')),
    src: _pickExistingDir(path.join(publicDir, 'src'), path.join(appRootDir, 'src')),
    characters: _pickExistingDir(path.join(publicDir, 'characters'), path.join(appRootDir, 'characters')),
};
logLine(`boot: appRootDir=${appRootDir}`);
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

// Identify the running build and discourage edge caching during troubleshooting.
app.use((req, res, next) => {
    res.setHeader('X-App-Version', appVersion);
    next();
});

// API routes (vendored under Application/ so Hostinger can deploy only this folder)
const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/user.routes');
const tasksRoutes = require('./api/routes/tasks.routes');
const characterRoutes = require('./api/routes/character.routes');
const { error404, error500 } = require('./api/middleware/errors.middleware');

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/__version', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, version: appVersion, node: process.version });
});

// Avoid noisy 404s in browser console.
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Serve the site homepage explicitly (prevents API-style JSON 404 at '/').
app.get('/', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(path.join(publicDir, 'index.html'));
});

// Some hosts/browsers request the explicit document. Keep it equivalent to '/'.
app.get('/index.html', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(path.join(publicDir, 'index.html'));
});

// Critical client scripts:
// - must not be cached during troubleshooting
// - must always come from public/ when available
const _sendNoStoreFile = (res, primaryPath, fallbackPath) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (primaryPath && fs.existsSync(primaryPath)) return res.sendFile(primaryPath);
    if (fallbackPath && fs.existsSync(fallbackPath)) return res.sendFile(fallbackPath);
    return res.status(404).end();
};

app.get('/lib/api.config.js', (req, res) => {
    return _sendNoStoreFile(
        res,
        path.join(publicDir, 'lib', 'api.config.js'),
        path.join(assetsDir.lib, 'api.config.js'),
    );
});

app.get('/lib/service-helpers.js', (req, res) => {
    return _sendNoStoreFile(
        res,
        path.join(publicDir, 'lib', 'service-helpers.js'),
        path.join(assetsDir.lib, 'service-helpers.js'),
    );
});

app.get('/api/health', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, service: 'api', version: appVersion, node: process.version });
});

// Convenience: make /api itself respond (helps debug hosting/routing).
app.get('/api', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({
        ok: true,
        service: 'api',
        version: appVersion,
        node: process.version,
        endpoints: ['/api/health', '/api/auth/login (POST)', '/api/auth/register (POST)'],
    });
});

// Helpful method hints so GET requests don't look like "missing routes".
app.get('/api/auth/login', (req, res) => res.status(405).json({ ok: false, msg: 'Method Not Allowed. Use POST.' }));
app.get('/api/auth/register', (req, res) => res.status(405).json({ ok: false, msg: 'Method Not Allowed. Use POST.' }));

// Host/CDN/WAF sometimes blocks "__*" paths. Provide a safe alternative.
// Enabled only when DIAGNOSTICS_KEY is set.
app.get('/api/diag', (req, res) => {
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

    const safeListDir = (dir) => {
        try {
            if (!fs.existsSync(dir)) return null;
            const stat = fs.statSync(dir);
            if (!stat.isDirectory()) return null;
            return fs.readdirSync(dir).slice(0, 200);
        } catch (e) {
            return null;
        }
    };

    const dbTarget = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
    };

    const dbTest = async () => {
        try {
            const getConnection = require('./api/db-config');

            const timeoutMs = Number(process.env.DIAG_DB_TIMEOUT_MS) || 6000;
            const timeoutPromise = new Promise((_, reject) => {
                const t = setTimeout(() => {
                    clearTimeout(t);
                    reject(Object.assign(new Error('DB diag timeout'), { code: 'DIAG_DB_TIMEOUT' }));
                }, timeoutMs);
            });

            const con = await Promise.race([getConnection(), timeoutPromise]);
            const select1 = await new Promise((resolve, reject) => {
                con.query('SELECT 1 AS ok', (err, rows) => {
                    if (err) return reject(err);
                    return resolve(rows);
                });
            });

            try {
                con.end();
            } catch (e) {
                // ignore
            }

            return { ok: true, select1 };
        } catch (err) {
            return {
                ok: false,
                error: {
                    code: err && err.code ? String(err.code) : undefined,
                    errno: err && err.errno ? Number(err.errno) : undefined,
                    syscall: err && err.syscall ? String(err.syscall) : undefined,
                    address: err && err.address ? String(err.address) : undefined,
                    port: err && err.port ? Number(err.port) : undefined,
                    fatal: err && typeof err.fatal === 'boolean' ? err.fatal : undefined,
                    message: err && err.message ? String(err.message).slice(0, 300) : undefined,
                },
            };
        }
    };

    const installOk = safeRead(path.join(process.cwd(), 'install.ok'));
    const startOk = safeRead(path.join(process.cwd(), 'start.ok'));
    const appLog = safeRead(logPath);

    const publicCssDir = path.join(publicDir, 'css');
    const publicLibDir = path.join(publicDir, 'lib');
    const publicImagesDir = path.join(publicDir, 'images');

    res.setHeader('Cache-Control', 'no-store');
    return Promise.resolve(dbTest()).then((db) => res.json({
        ok: true,
        version: appVersion,
        node: process.version,
        cwd: process.cwd(),
        appRootDir,
        publicDir,
        publicDirExists: fs.existsSync(publicDir),
        publicDirEntries: safeListDir(publicDir),
        publicCssDirExists: fs.existsSync(publicCssDir),
        publicCssDirEntries: safeListDir(publicCssDir),
        publicLibDirExists: fs.existsSync(publicLibDir),
        publicLibDirEntries: safeListDir(publicLibDir),
        publicImagesDirExists: fs.existsSync(publicImagesDir),
        publicImagesDirEntries: safeListDir(publicImagesDir),
        assetsDir,
        assetsCssDirExists: fs.existsSync(assetsDir.css),
        assetsCssDirEntries: safeListDir(assetsDir.css),
        assetsLibDirExists: fs.existsSync(assetsDir.lib),
        assetsLibDirEntries: safeListDir(assetsDir.lib),
        assetsImagesDirExists: fs.existsSync(assetsDir.images),
        assetsImagesDirEntries: safeListDir(assetsDir.images),
        assetsPdfDirExists: fs.existsSync(assetsDir.pdf),
        assetsPdfDirEntries: safeListDir(assetsDir.pdf),
        assetsSrcDirExists: fs.existsSync(assetsDir.src),
        assetsSrcDirEntries: safeListDir(assetsDir.src),
        assetsCharactersDirExists: fs.existsSync(assetsDir.characters),
        assetsCharactersDirEntries: safeListDir(assetsDir.characters),
        port,
        dbTarget,
        db,
        installOk: installOk ? installOk.trim() : null,
        startOk: startOk ? startOk.trim() : null,
        appLogTail: appLog ? String(appLog).slice(-4000) : null,
    }));
});

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

    const safeListDir = (dir) => {
        try {
            if (!fs.existsSync(dir)) return null;
            const stat = fs.statSync(dir);
            if (!stat.isDirectory()) return null;
            return fs.readdirSync(dir).slice(0, 200);
        } catch (e) {
            return null;
        }
    };

    const dbTarget = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
    };

    const dbTest = async () => {
        try {
            // Lazy require so /__diag still works even if DB code has issues.
            const getConnection = require('./api/db-config');

            const timeoutMs = Number(process.env.DIAG_DB_TIMEOUT_MS) || 6000;
            const timeoutPromise = new Promise((_, reject) => {
                const t = setTimeout(() => {
                    clearTimeout(t);
                    reject(Object.assign(new Error('DB diag timeout'), { code: 'DIAG_DB_TIMEOUT' }));
                }, timeoutMs);
            });

            const con = await Promise.race([getConnection(), timeoutPromise]);
            const select1 = await new Promise((resolve, reject) => {
                con.query('SELECT 1 AS ok', (err, rows) => {
                    if (err) return reject(err);
                    return resolve(rows);
                });
            });

            try {
                con.end();
            } catch (e) {
                // ignore
            }

            return { ok: true, select1 };
        } catch (err) {
            return {
                ok: false,
                error: {
                    code: err && err.code ? String(err.code) : undefined,
                    errno: err && err.errno ? Number(err.errno) : undefined,
                    syscall: err && err.syscall ? String(err.syscall) : undefined,
                    address: err && err.address ? String(err.address) : undefined,
                    port: err && err.port ? Number(err.port) : undefined,
                    fatal: err && typeof err.fatal === 'boolean' ? err.fatal : undefined,
                    message: err && err.message ? String(err.message).slice(0, 300) : undefined,
                },
            };
        }
    };

    const installOk = safeRead(path.join(process.cwd(), 'install.ok'));
    const startOk = safeRead(path.join(process.cwd(), 'start.ok'));
    const appLog = safeRead(logPath);

    const publicCssDir = path.join(publicDir, 'css');
    const publicLibDir = path.join(publicDir, 'lib');
    const publicImagesDir = path.join(publicDir, 'images');

    return Promise.resolve(dbTest()).then((db) => res.json({
        ok: true,
        node: process.version,
        cwd: process.cwd(),
        appRootDir,
        publicDir,
        publicDirExists: fs.existsSync(publicDir),
        publicDirEntries: safeListDir(publicDir),
        publicCssDirExists: fs.existsSync(publicCssDir),
        publicCssDirEntries: safeListDir(publicCssDir),
        publicLibDirExists: fs.existsSync(publicLibDir),
        publicLibDirEntries: safeListDir(publicLibDir),
        publicImagesDirExists: fs.existsSync(publicImagesDir),
        publicImagesDirEntries: safeListDir(publicImagesDir),
        assetsDir,
        assetsCssDirExists: fs.existsSync(assetsDir.css),
        assetsCssDirEntries: safeListDir(assetsDir.css),
        assetsLibDirExists: fs.existsSync(assetsDir.lib),
        assetsLibDirEntries: safeListDir(assetsDir.lib),
        assetsImagesDirExists: fs.existsSync(assetsDir.images),
        assetsImagesDirEntries: safeListDir(assetsDir.images),
        assetsPdfDirExists: fs.existsSync(assetsDir.pdf),
        assetsPdfDirEntries: safeListDir(assetsDir.pdf),
        assetsSrcDirExists: fs.existsSync(assetsDir.src),
        assetsSrcDirEntries: safeListDir(assetsDir.src),
        assetsCharactersDirExists: fs.existsSync(assetsDir.characters),
        assetsCharactersDirEntries: safeListDir(assetsDir.characters),
        port,
        dbTarget,
        db,
        installOk: installOk ? installOk.trim() : null,
        startOk: startOk ? startOk.trim() : null,
        appLogTail: appLog ? String(appLog).slice(-4000) : null,
    }));
});

app.use(express.static(publicDir));

// Primary: serve assets from Application/* (this repo layout).
app.use('/css', express.static(assetsDir.css));
app.use('/pdf', express.static(assetsDir.pdf));
app.use('/images', express.static(assetsDir.images));
app.use('/lib', express.static(assetsDir.lib));
app.use('/characters', express.static(assetsDir.characters));
app.use('/src', express.static(assetsDir.src));

// Back-compat: serve assets from Application/public/* if they exist (older layout).
app.use('/css', express.static(path.join(publicDir, 'css')));
app.use('/pdf', express.static(path.join(publicDir, 'pdf')));
app.use('/images', express.static(path.join(publicDir, 'images')));
app.use('/lib', express.static(path.join(publicDir, 'lib')));
app.use('/characters', express.static(path.join(publicDir, 'characters')));
app.use('/src', express.static(path.join(publicDir, 'src')));

// API error handling (kept consistent with Web-Server)
app.use('/api', error404);
app.use('/api', error500);

// Non-API 404
app.use((req, res) => res.status(404).send('Not Found'));

// Non-API 500
app.use((err, req, res, next) => {
    console.error('unhandled error', err);
    res.status(500).send('Internal Server Error');
});

app.listen(port, '0.0.0.0', function () {
    console.log('Server started at http://localhost:%s', port);
    logLine(`listening: http://localhost:${port}`);
});