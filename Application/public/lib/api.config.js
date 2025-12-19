// Default behavior: use same-origin `/api` (production-style).
// If you want to point somewhere else (including local dev at localhost:3001), override it.
// You can override via:
// - <meta name="api-base-url" content="/api"> (same-origin)
// - <meta name="api-base-url" content="https://api.example.com/api"> (separate API host)
// - window.__API_BASE_URL = '/api' OR 'https://api.example.com/api'

// NOTE: We intentionally do NOT auto-switch to localhost:3001 in dev.
// If you need local dev API, set a meta tag or window.__API_BASE_URL to "http://localhost:3001/api".

const _readMeta = (name) => {
    try {
        const el = document.querySelector(`meta[name="${name}"]`);
        return el && el.content ? el.content : null;
    } catch (e) {
        return null;
    }
};

const _normalizeApiBase = (raw) => {
    if (!raw) return null;
    const trimmed = String(raw).trim().replace(/\/+$/, '');
    if (!trimmed) return null;
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const _isLocalHostName = (host) => {
    const h = String(host || '').toLowerCase();
    return h === 'localhost' || h === '127.0.0.1' || h === '::1';
};

// In production, never allow a localhost override (it breaks users with "Failed to fetch").
const _isUnsafeOverrideForThisOrigin = (rawOverride) => {
    if (!rawOverride) return false;

    try {
        const pageHost = typeof window !== 'undefined' && window.location ? window.location.hostname : '';
        const pageProtocol = typeof window !== 'undefined' && window.location ? window.location.protocol : '';
        if (_isLocalHostName(pageHost)) return false;

        const normalized = _normalizeApiBase(rawOverride);
        if (!normalized) return false;

        // Allow relative paths like '/api'.
        if (normalized.startsWith('/')) return false;

        const url = new URL(normalized);
        // If the page is HTTPS, an http:// API base will be upgraded (CSP upgrade-insecure-requests)
        // and typically fail. Reject it and fall back to same-origin '/api'.
        if (pageProtocol === 'https:' && url.protocol !== 'https:') return true;
        return _isLocalHostName(url.hostname);
    } catch (e) {
        return false;
    }
};

const _overrideApiBase =
    (typeof window !== 'undefined' && (window.__API_BASE_URL || window.API_BASE_URL)) ||
    _readMeta('api-base-url') ||
    _readMeta('api-base');

const _apiBase = _isUnsafeOverrideForThisOrigin(_overrideApiBase) ?
    null :
    _normalizeApiBase(_overrideApiBase);

const BASE_API_URL = _apiBase || '/api';