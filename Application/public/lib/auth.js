const _getAuthService = () => {
    try {
        if (typeof window !== 'undefined' && window.authService) return window.authService;
    } catch (e) {
        // ignore
    }

    // Fallback: if global lexical binding exists, use it.
    if (typeof authService !== 'undefined') return authService;
    return null;
};

const _ensureAuthServiceLoaded = async () => {
    const existing = _getAuthService();
    if (existing) return existing;

    try {
        if (typeof window === 'undefined') return null;
        if (window.__authServiceLoading) return await window.__authServiceLoading;

        window.__authServiceLoading = new Promise((resolve) => {
            const script = document.createElement('script');
            script.async = true;
            script.src = `/lib/auth-service.v2.js?__cb=${Date.now()}`;
            script.onload = () => resolve(_getAuthService());
            script.onerror = () => resolve(null);
            document.head.appendChild(script);
        });

        return await window.__authServiceLoading;
    } catch (e) {
        return null;
    }
};

const _probeAuthServiceScript = async () => {
    try {
        const url = `/lib/auth-service.v2.js?__probe=${Date.now()}`;
        const res = await fetch(url, {
            cache: 'no-store'
        });
        const ct = res.headers && res.headers.get ? res.headers.get('content-type') : null;
        return {
            ok: res.ok,
            status: res.status,
            contentType: ct,
            url
        };
    } catch (e) {
        return {
            ok: false,
            status: 0,
            contentType: null,
            url: '/lib/auth-service.v2.js',
            error: String(e && e.message ? e.message : e)
        };
    }
};

const doLogin = async (e) => {
    e.preventDefault();

    const svc = await _ensureAuthServiceLoaded();
    if (!svc) {
        const probe = await _probeAuthServiceScript();
        const detail = probe && probe.status ? ` (status ${probe.status}${probe.contentType ? `, ${probe.contentType}` : ''})` : '';
        const err = (typeof window !== 'undefined' && window.__authServiceError && window.__authServiceError.message) ? `\nerror: ${window.__authServiceError.message}` : '';
        alert(`AuthService failed to load. Check ${probe.url}${detail} and that /lib/api.config.js loaded first.${err}`);
        return;
    }

    const username = document.getElementById('formInputUsername').value;
    const password = document.getElementById('formInputPassword').value;

    try {
        const res = await svc.login({
            username,
            password
        });
        const {
            auth,
            expires_in,
            access_token,
            refresh_token
        } = res;
        const expiryDate = svc.setExpiration(expires_in);

        setStorage('isAuth', auth);
        setStorage('expires_in', expiryDate);
        setStorage('access_token', access_token);
        setStorage('refresh_token', refresh_token);

        if (res) {
            window.location.href = 'home.html';
        }
    } catch (err) {
        alert(err && err.message ? err.message : 'Failed to login. Please try again later.');
    }
};

const doRegister = async (e) => {
    e.preventDefault();

    const svc = await _ensureAuthServiceLoaded();
    if (!svc) {
        const probe = await _probeAuthServiceScript();
        const detail = probe && probe.status ? ` (status ${probe.status}${probe.contentType ? `, ${probe.contentType}` : ''})` : '';
        const err = (typeof window !== 'undefined' && window.__authServiceError && window.__authServiceError.message) ? `\nerror: ${window.__authServiceError.message}` : '';
        alert(`AuthService failed to load. Check ${probe.url}${detail} and that /lib/api.config.js loaded first.${err}`);
        return;
    }

    const username = document.getElementById('formInputUsernameReg').value;
    const email = document.getElementById('formInputEmailReg').value;
    const password = document.getElementById('formInputPasswordReg').value;

    try {
        const res = await svc.register({
            username,
            email,
            password,
        });

        if (res) {
            window.location.href = '/';
        }
    } catch (err) {
        alert(err && err.message ? err.message : 'Failed to register. Please try again later.');
    }
};

const doLogout = (e) => {
    e.preventDefault();
    const svc = _getAuthService();
    if (!svc) {
        alert('AuthService failed to load.');
        return;
    }
    svc.logout();
};

// (() => {
//     const login = document.getElementById('login');
//     const logout = document.getElementById('logout');
//     if (!authService.isAuth()) {
//         if (login) {
//             login.style.display = 'block';
//         } else {
//             logout.style.display = 'none';
//         }
//     } else {
//         if (login) {
//             login.style.display = 'none';
//         } else {
//             logout.style.display = 'block';
//         }
//     }
// })();

// (() => {
//     if (storageHasData()) {
//         const isAuth = getStorage('isAuth');
//         if (!isAuth) {
//             document.getElementById('logout').style.display = 'none';
//         } else {
//             document.getElementById('logout').style.display = 'block';
//         }
//     }
// })();