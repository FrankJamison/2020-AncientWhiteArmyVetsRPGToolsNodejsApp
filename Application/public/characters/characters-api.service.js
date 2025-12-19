const _isLocalHostName = (host) => {
    const h = String(host || '').toLowerCase();
    return h === 'localhost' || h === '127.0.0.1' || h === '::1';
};

// Production safety: never let a localhost/dev override leak into a real domain.
// If the page is not localhost, always use same-origin '/api'.
const _pageHost = typeof window !== 'undefined' && window.location ? window.location.hostname : '';
const _DECLARED_BASE_API_URL = (typeof BASE_API_URL !== 'undefined' && BASE_API_URL) ? BASE_API_URL : '/api';
const _EFFECTIVE_BASE_API_URL = _isLocalHostName(_pageHost) ? _DECLARED_BASE_API_URL : '/api';

const CHARACTERS_API = `${_EFFECTIVE_BASE_API_URL}/characters`; // http://localhost:3000/api/tasks

class CharactersService {
    getCharacters = () => _get(CHARACTERS_API, OPTIONS_WITH_AUTH);

    addCharacter = (formData) => _post(CHARACTERS_API, formData, DEFAULT_OPTIONS_WITH_AUTH);

    deleteCharacter = (characterId) => _delete(`${CHARACTERS_API}/${characterId}`, OPTIONS_WITH_AUTH);
}