const _getAccessToken = () => (storageHasData() ? getStorage('access_token') : '');

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
    const res = await fetch(url, {
        method: 'GET',
        ...mergedOptions,
    });

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
    const res = await fetch(url, {
        method: 'POST',
        ...mergedOptions,
        body: JSON.stringify(data),
    });

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
    const res = await fetch(url, {
        method: 'PUT',
        ...mergedOptions,
        body: JSON.stringify(data),
    });

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
    const res = await fetch(url, {
        method: 'DELETE',
        ...mergedOptions,
    });

    await _throwForBadResponse(res);
    const payload = await _readJsonSafely(res);
    if (payload === null) throw new Error('Invalid JSON response.');
    return payload;
};