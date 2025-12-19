const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 4000;

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

app.get('/health', (req, res) => res.json({ ok: true }));

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

app.listen(port, '0.0.0.0', function () {
    console.log('Server started at http://localhost:%s', port);
    logLine(`listening: http://localhost:${port}`);
});