const _getAccessToken = () => (storageHasData() ? getStorage('access_token') : '');

// Note: _isLocalHostName is defined in api.config.js which loads before this file

// Hostinger edge/CDN has shown signs of caching error responses (fixed ETag/content-length).
// In production (non-localhost), add a cache-busting query parameter.
const _withCacheBust = (url) => {
    try {
        const pageHost = typeof window !== 'undefined' && window.location ? window.location.hostname : '';
        if (_isLocalHostName(pageHost)) return url;

        // Add a unique query param to avoid intermediate caching.
        const u = new URL(String(url), typeof window !== 'undefined' ? window.location.origin : undefined);
        u.searchParams.set('__cb', String(Date.now()));
        return u.toString();
    } catch (e) {
        // If URL parsing fails (e.g., relative URL in older browsers), fall back safely.
        const sep = String(url).includes('?') ? '&' : '?';
        return `${url}${sep}__cb=${Date.now()}`;
    }
};

const _withFreshAuthHeader = (options) => {
    const accessToken = _getAccessToken();
    const nextOptions = options ? {
        ...options
    } : {};
    const nextHeaders = {
        ...(nextOptions.headers ? nextOptions.headers : {}),
    };

    if (accessToken) {
        nextHeaders.Authorization = `Bearer ${accessToken}`;
    } else {
        // Avoid sending a malformed header like `Bearer `.
        delete nextHeaders.Authorization;
    }

    nextOptions.headers = nextHeaders;
    return nextOptions;
};

const DEFAULT_OPTIONS = {
    headers: {
        'Content-Type': 'application/json',
    },
};

const DEFAULT_OPTIONS_WITH_AUTH = {
    headers: {
        // NOTE: Authorization will be overwritten at request time.
        Authorization: '',
        'Content-Type': 'application/json',
    },
};

const OPTIONS_WITH_AUTH = {
    headers: {
        // NOTE: Authorization will be overwritten at request time.
        Authorization: '',
    },
};

const _readJsonSafely = async (res) => {
    try {
        return await res.json();
    } catch (err) {
        return null;
    }
};

const _throwForBadResponse = async (res) => {
    if (res.ok) return;

    const payload = await _readJsonSafely(res);
    const baseMessage =
        (payload && payload.msg) ||
        (payload && payload.error && payload.error.message) ||
        `Request failed (${res.status})`;

    const errorCode = payload && (payload.error_code || (payload.error && payload.error.code));
    const message = errorCode ? `${baseMessage} (error_code: ${String(errorCode)})` : baseMessage;
    throw new Error(message);
};

/**
 * Generic Read API handler.
 *
 * @param {sting} url - address to make request to
 * @param {any} options - additional options to send. Defaults to options with auth headers
 */
const _get = async (url, options = DEFAULT_OPTIONS_WITH_AUTH) => {
    const mergedOptions = _withFreshAuthHeader(options);
    const finalUrl = _withCacheBust(url);
    let res;
    try {
        res = await fetch(finalUrl, {
            method: 'GET',
            cache: 'no-store',
            ...mergedOptions,
        });
    } catch (err) {
        throw new Error(`Network error while requesting ${finalUrl}: ${err && err.message ? err.message : String(err)}`);
    }

    await _throwForBadResponse(res);
    const payload = await _readJsonSafely(res);
    if (payload === null) throw new Error('Invalid JSON response.');
    return payload;
};

/**
 * Generic Create API handler.
 *
 * @param {sting} url - address to make request to
 * @param {any} data - updates to send
 * @param {any} options - additional options to send. Defaults to options with normal headers
 */
const _post = async (url, data, options = DEFAULT_OPTIONS) => {
    const mergedOptions = _withFreshAuthHeader(options);
    const finalUrl = _withCacheBust(url);
    let res;
    try {
        res = await fetch(finalUrl, {
            method: 'POST',
            cache: 'no-store',
            ...mergedOptions,
            body: JSON.stringify(data),
        });
    } catch (err) {
        throw new Error(`Network error while requesting ${finalUrl}: ${err && err.message ? err.message : String(err)}`);
    }

    await _throwForBadResponse(res);
    const payload = await _readJsonSafely(res);
    if (payload === null) throw new Error('Invalid JSON response.');
    return payload;
};

/**
 * Generic Update API handler.
 * NOTE: PUT requests sctrictly require authentication.
 *
 * @param {sting} url - address to make request to
 * @param {any} data - updates to send
 * @param {any} options - additional options to send. Defaults to options with auth headers
 */
const _put = async (url, data, options = DEFAULT_OPTIONS_WITH_AUTH) => {
    const mergedOptions = _withFreshAuthHeader(options);
    const finalUrl = _withCacheBust(url);
    let res;
    try {
        res = await fetch(finalUrl, {
            method: 'PUT',
            cache: 'no-store',
            ...mergedOptions,
            body: JSON.stringify(data),
        });
    } catch (err) {
        throw new Error(`Network error while requesting ${finalUrl}: ${err && err.message ? err.message : String(err)}`);
    }

    await _throwForBadResponse(res);
    const payload = await _readJsonSafely(res);
    if (payload === null) throw new Error('Invalid JSON response.');
    return payload;
};

/**
 * Generic Delete API handler.
 * NOTE: DELETE requests sctrictly require authentication.
 *
 * @param {sting} url - address to make request to
 * @param {any} options - additional options to send. Defaults to options with auth headers
 */
const _delete = async (url, options = DEFAULT_OPTIONS_WITH_AUTH) => {
    const mergedOptions = _withFreshAuthHeader(options);
    const finalUrl = _withCacheBust(url);
    let res;
    try {
        res = await fetch(finalUrl, {
            method: 'DELETE',
            cache: 'no-store',
            ...mergedOptions,
        });
    } catch (err) {
        throw new Error(`Network error while requesting ${finalUrl}: ${err && err.message ? err.message : String(err)}`);
    }

    await _throwForBadResponse(res);
    const payload = await _readJsonSafely(res);
    if (payload === null) throw new Error('Invalid JSON response.');
    return payload;
};