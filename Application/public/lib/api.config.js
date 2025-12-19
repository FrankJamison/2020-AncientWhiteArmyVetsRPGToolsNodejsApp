// In local dev, the API runs separately on localhost:3001.
// In production, the safest default is same-origin `/api`.
// You can override via:
// - <meta name="api-base-url" content="/api"> (same-origin)
// - <meta name="api-base-url" content="https://api.example.com/api"> (separate API host)
// - window.__API_BASE_URL = '/api' OR 'https://api.example.com/api'

const _isLocalHost =
	typeof window !== 'undefined' &&
	(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

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

const _overrideApiBase =
	(typeof window !== 'undefined' && (window.__API_BASE_URL || window.API_BASE_URL)) ||
	_readMeta('api-base-url') ||
	_readMeta('api-base');

const _apiBase = _normalizeApiBase(_overrideApiBase);

const BASE_API_URL = _apiBase || (_isLocalHost ? 'http://localhost:3001/api' : '/api');