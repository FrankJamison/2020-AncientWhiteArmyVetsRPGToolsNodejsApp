const express = require('express');
const path = require('path');

const apiApp = require('./api/app');

const app = express();
const port = process.env.PORT || 3001;

// Serve the static frontend pages
const staticRoot = path.join(__dirname, '../public');
app.use(express.static(staticRoot));

// Serve the API from the same origin
app.use(apiApp);

app.listen(port, () => {
    console.log('Running on port: %s', port);
});

