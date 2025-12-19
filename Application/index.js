// Hostinger entrypoint: keep this file at the Application/ root.
// Hostinger may force a default entry file; route that default to the combined server.
// The combined server serves the static site (Application/public) AND the API under /api/*.

require('../Web-Server/src/index.js');