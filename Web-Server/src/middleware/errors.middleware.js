// ************************************
// ERROR-HANDLING MIDDLEWARE FUNCTIONS
// ************************************

/**
 * Handle req that would produce a 404 status code and respons accordingly.
 */
exports.error404 = (req, res, next) => {
    next({
        message: 'Not Found',
        status: 404
    });
};

/**
 * Handle req that would produce a 500 status code and respons accordingly.
 */
exports.error500 = (error, req, res, next) => {
    try {
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.setHeader('CDN-Cache-Control', 'no-store, max-age=0');
        res.setHeader('Surrogate-Control', 'no-store');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.removeHeader('ETag');
    } catch (e) {
        // ignore
    }
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
            code: error.code,
        },
        app_version: process.env.APP_VERSION,
        request_id: res && res.locals ? res.locals.requestId : undefined,
    });
};