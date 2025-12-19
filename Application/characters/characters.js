/**
 * AJAX add new characters to character list on save.
 */
const doAddCharacter = async (e) => {
    e.preventDefault();
    characterList._addCharacterEventHandler();
};