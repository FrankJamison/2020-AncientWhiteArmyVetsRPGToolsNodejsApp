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

app.get('/health', (req, res) => res.json({ ok: true }));

app.use(express.static(publicDir));

app.use('/css', express.static(path.join(publicDir, 'css')));
app.use('/js', express.static(path.join(publicDir, 'src')));
app.use('/pdf', express.static(path.join(publicDir, 'pdf')));
app.use('/images', express.static(path.join(publicDir, 'images')));
app.use('/lib', express.static(path.join(publicDir, 'lib')));
app.use('/characters', express.static(path.join(publicDir, 'characters')));
app.use('/src', express.static(path.join(publicDir, 'src')));

app.listen(port, function () {
    console.log('Server started at http://localhost:%s', port);
    logLine(`listening: http://localhost:${port}`);
});