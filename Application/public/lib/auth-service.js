(function() {
    try {
        if (typeof window !== 'undefined') {
            window.__authServiceScript = {
                startedAt: new Date().toISOString(),
                file: '/lib/auth-service.js',
            };
        }

        const _isLocalHostName = (host) => {
            const h = String(host || '').toLowerCase();
            return h === 'localhost' || h === '127.0.0.1' || h === '::1';
        };

        // Production safety: never let a localhost/dev override leak into a real domain.
        // If the page is not localhost, always use same-origin '/api'.
        const _pageHost = typeof window !== 'undefined' && window.location ? window.location.hostname : '';
        const _DECLARED_BASE_API_URL = (typeof BASE_API_URL !== 'undefined' && BASE_API_URL) ? BASE_API_URL : '/api';
        const _EFFECTIVE_BASE_API_URL = _isLocalHostName(_pageHost) ? _DECLARED_BASE_API_URL : '/api';

        const AUTH_API = `${_EFFECTIVE_BASE_API_URL}/auth`; // http://localhost:3000/api/auth
        const USER_API = `${_EFFECTIVE_BASE_API_URL}/user`; // http://localhost:3000/api/user

        /**
         * @class AuthService
         *
         * Service for authentication methods.
         */
        class AuthService {
            /**
             * Registers a new user.
             *
             * @param {Object} formData - { username, email, password }
             */
            register(formData) {
                return _post(`${AUTH_API}/register`, formData);
            }

            /**
             * Logs a user into the application.
             *
             * @param {Object} formData - { username, password }
             */
            login(formData) {
                return _post(`${AUTH_API}/login`, formData);
            }

            setExpiration(maxExpiration) {
                return new Date(new Date().getTime() + maxExpiration * 1000);
            }

            /**
             * Check the current user's authentication.
             */
            isAuth() {
                return getStorage('access_token');
            }

            /**
             * Check token's lifespan. Expireation is provided by the server.
             */
            isTokenExpired() {
                const expiryDate = getStorage('expires_in');
                const isExpired = expiryDate === new Date();

                if (isExpired) {
                    localStorage.clear();
                }

                return isExpired;
            }

            /**
             * Logs the user out of the current session.
             */
            logout() {
                localStorage.clear();
                window.location.href = '/';
            }
        }

        const authService = new AuthService();

        // Ensure authService is accessible across scripts regardless of hosting quirks.
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