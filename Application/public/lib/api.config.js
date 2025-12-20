// API base URL used by front-end service scripts.
// Hosted default: same origin as the page (e.g. https://www.ancientwhitearmyvet.com).
// This yields a base like: https://<host>/api
const API_ORIGIN = (window.__API_ORIGIN || window.location.origin || '').replace(/\/$/, '');
const BASE_API_URL = API_ORIGIN ? `${API_ORIGIN}/api` : '/api';


