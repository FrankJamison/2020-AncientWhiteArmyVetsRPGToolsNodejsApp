const CHARACTERS_API = `${BASE_API_URL}/characters`; // http://localhost:3000/api/tasks

class CharactersService {
    getCharacters = () => _get(CHARACTERS_API, OPTIONS_WITH_AUTH);

    addCharacter = (formData) => _post(CHARACTERS_API, formData, DEFAULT_OPTIONS_WITH_AUTH);

    deleteCharacter = (characterId) => _delete(`${CHARACTERS_API}/${characterId}`, OPTIONS_WITH_AUTH);
}