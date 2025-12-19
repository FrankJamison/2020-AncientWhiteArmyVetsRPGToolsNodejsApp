// v2 filename to bypass stubborn CDN caches
// Intentionally no imports/modules; relies on globals provided by other lib scripts.
(function() {
    try {
        if (typeof window !== 'undefined') {
            window.__authServiceScript = {
                startedAt: new Date().toISOString(),
                file: '/lib/auth-service.v2.js',
            };
        }

        const _withCacheBust = (url) => {
            try {
                const u = new URL(String(url), typeof window !== 'undefined' ? window.location.origin : undefined);
                u.searchParams.set('__cb', String(Date.now()));
                return u.toString();
            } catch (e) {
                const sep = String(url).includes('?') ? '&' : '?';
                return `${url}${sep}__cb=${Date.now()}`;
            }
        };

        const _readJsonSafely = async (res) => {
            try {
                return await res.json();
            } catch (err) {
                return null;
            }
        };

        const _postJson = async (url, data) => {
            const finalUrl = _withCacheBust(url);
            let res;
            try {
                res = await fetch(finalUrl, {
                    method: 'POST',
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
            } catch (err) {
                throw new Error(`Network error while requesting ${finalUrl}: ${err && err.message ? err.message : String(err)}`);
            }

            if (!res.ok) {
                const payload = await _readJsonSafely(res);
                const baseMessage =
                    (payload && payload.msg) ||
                    (payload && payload.error && payload.error.message) ||
                    `Request failed (${res.status})`;
                const errorCode = payload && (payload.error_code || (payload.error && payload.error.code));
                const message = errorCode ? `${baseMessage} (error_code: ${String(errorCode)})` : baseMessage;
                const err = new Error(message);
                err.status = res.status;
                err.url = finalUrl;
                throw err;
            }

            const payload = await _readJsonSafely(res);
            if (payload === null) throw new Error('Invalid JSON response.');
            return payload;
        };

        const _isLocalHostName = (host) => {
            const h = String(host || '').toLowerCase();
            return h === 'localhost' || h === '127.0.0.1' || h === '::1';
        };

        // Production safety: never let a localhost/dev override leak into a real domain.
        // If the page is not localhost, always use same-origin '/api'.
        const _pageHost = typeof window !== 'undefined' && window.location ? window.location.hostname : '';
        const _DECLARED_BASE_API_URL = (typeof BASE_API_URL !== 'undefined' && BASE_API_URL) ? BASE_API_URL : '/api';
        const _EFFECTIVE_BASE_API_URL = _isLocalHostName(_pageHost) ? _DECLARED_BASE_API_URL : '/api';

        const AUTH_API = `${_EFFECTIVE_BASE_API_URL}/auth`;

        class AuthService {
            register(formData) {
                const cb = Date.now();
                return _postJson(`${AUTH_API}/register/${cb}`, formData).catch((err) => {
                    if (err && err.status === 404) return _postJson(`${AUTH_API}/register`, formData);
                    throw err;
                });
            }

            login(formData) {
                const cb = Date.now();
                return _postJson(`${AUTH_API}/login/${cb}`, formData).catch((err) => {
                    if (err && err.status === 404) return _postJson(`${AUTH_API}/login`, formData);
                    throw err;
                });
            }

            setExpiration(maxExpiration) {
                return new Date(new Date().getTime() + maxExpiration * 1000);
            }

            isAuth() {
                return getStorage('access_token');
            }

            isTokenExpired() {
                const expiryDate = getStorage('expires_in');
                const isExpired = expiryDate === new Date();

                if (isExpired) {
                    localStorage.clear();
                }

                return isExpired;
            }

            logout() {
                localStorage.clear();
                window.location.href = '/';
            }
        }

        const authService = new AuthService();

        if (typeof window !== 'undefined') {
            window.authService = authService;
            window.__authServiceLoaded = true;
            if (window.__authServiceScript) window.__authServiceScript.executed = true;
        }
    } catch (err) {
        try {
            if (typeof window !== 'undefined') {
                window.__authServiceLoaded = false;
                window.__authServiceError = {
                    message: err && err.message ? String(err.message) : String(err),
                    stack: err && err.stack ? String(err.stack) : undefined,
                };
                if (window.__authServiceScript) window.__authServiceScript.executed = false;
            }
        } catch (e) {
            // ignore
        }
    }
})();