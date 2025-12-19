/**
 * @class CharacterList
 *
 * Creates a list of characterss and updates a character
 */

class CharacterList {
    characters = [];
    charactersService;

    constructor(charactersService) {
        this.charactersService = charactersService;
    }

    init() {
        this.render();
    }

    /**
     * DOM renderer for building the list row item.
     * Uses bootstrap classes with some custom overrides.
     *
     * {@link https://getbootstrap.com/docs/4.4/components/list-group/}
     * @example
     * <li class="list-group-item">
     *   <button class="btn btn-secondary" onclick="deleteCharacter(e, index)">X</button>
     *   <span>Character name</span>
     *   <span>Character class</span>
     *   <span>Character Level</span>
     *   <span>Character Build</span>
     *   <span>Character Race</span>
     *   <span>Character Sheet</span>
     *   <span>Character Image</span>
     *   <span>date create</span>
     * </li>
     */
    _renderListRowItem = (character) => {
        const characterItem = document.createElement('li');
        characterItem.id = `character-${character.character_id}`;
        characterItem.className = 'character-item';

        const deleteBtn = document.createElement('button');
        const deleteBtnTxt = document.createTextNode('Delete Character');
        deleteBtn.className = 'btn btn-secondary delete-btn';
        deleteBtn.addEventListener('click', this._deleteEventHandler(character.character_id));
        deleteBtn.appendChild(deleteBtnTxt);

        const characterCard = document.createElement('div');
        characterCard.className = 'character-card';

        const characterImage = document.createElement('div');

        /* Dynamically reates the link for the character image using information from the database */
        characterImage.className = 'character-image';
        characterImage.innerHTML = '<img src="../images/characters/' + character.character_image + '" alt="' + character.character_name + '" />';

        const characterContent = document.createElement('div');
        characterContent.className = 'character-content';

        /* Dynamically pulls the character name from teh database */
        const characterName = document.createElement('h2');
        characterName.className = 'character-name';
        const characterNameText = document.createTextNode(character.character_name);
        characterName.appendChild(characterNameText);

        /* Dynamically pulls the class, level, and build from the database */
        const characterClass = document.createElement('h3');
        characterClass.className = 'character-class';
        const characterClassText = document.createTextNode(character.character_class + ' ' + character.character_level + ': ' + character.character_build);
        characterClass.appendChild(characterClassText);

        /* Dynamically pulls the character race from the database. */
        const characterRace = document.createElement('p');
        characterRace.className = 'character-race';
        const characterRaceText = document.createTextNode(character.character_race);
        characterRace.appendChild(characterRaceText);

        /* Dynamically creates the link to the character sheet pdf using data stored in the database */
        const characterSheet = document.createElement('a');
        characterSheet.className = 'character-sheet';
        const characterSheetLink = '../pdf/characters/' + character.character_level + '/' + character.character_sheet;
        characterSheet.setAttribute('href', characterSheetLink);
        const characterSheetLinkText = document.createTextNode('Download');
        characterSheet.appendChild(characterSheetLinkText);

        // add list item's details
        characterCard.appendChild(characterImage);
        characterContent.appendChild(characterName);
        characterContent.appendChild(characterClass);
        characterContent.appendChild(characterRace);
        characterContent.appendChild(characterSheet);
        characterContent.appendChild(deleteBtn);
        characterCard.appendChild(characterContent);
        characterItem.appendChild(characterCard);

        characterItem.style.display = "block";

        return characterItem;
    };

    /**
     * DOM renderer for assembling the list items then mounting them to a parent node.
     */
    _renderList = () => {
        // get the "Loading..." text node from parent element
        const charactersDiv = document.getElementById('characters');
        const loadingDiv = charactersDiv.childNodes[0];
        const fragment = document.createDocumentFragment();
        const ul = document.createElement('ul');
        ul.id = 'characters-list';
        ul.className = 'characters';

        this.characters.map((character) => {
            const listGroupRowItem = this._renderListRowItem(character);

            // add entire list item
            ul.appendChild(listGroupRowItem);
        });

        fragment.appendChild(ul);
        charactersDiv.replaceChild(fragment, loadingDiv);
    };

    /**
     * DOM renderer for displaying a default message when a user has an empty list.
     */
    _renderMsg = () => {
        const charactersDiv = document.getElementById('characters');
        const loadingDiv = charactersDiv.childNodes[0];
        const listParent = document.getElementById('characters-list');
        const msgDiv = this._createMsgElement('Create some new characters!');

        if (charactersDiv) {
            charactersDiv.replaceChild(msgDiv, loadingDiv);
        } else {
            charactersDiv.replaceChild(msgDiv, listParent);
        }
    };

    /**
     * Pure function for adding a character.
     *
     * @param {Object} newCharacter - form's values as an object
     */
    addCharacter = async (newCharacter) => {
        try {
            const {
                character_name,
                character_race,
                character_class,
                character_build,
                character_level,
                character_sheet,
                character_image
            } = newCharacter;
            await this.charactersService.addCharacter({
                character_name,
                character_race,
                character_class,
                character_build,
                character_level,
                character_sheet,
                character_image
            }); // we just want the name and status
            this.characters.push(newCharacter); // push character with all its parts
        } catch (err) {
            console.log(err);
            alert('Unable to add character. Please try again later.');
        }
    };

    /**
     * DOM Event handler helper for adding a character to the DOM.
     *
     * @param {number} characterId - id of the character to delete
     */
    _addCharacterEventHandler = () => {
        const characterName = document.getElementById('formInputCharacterName');
        const character_name = characterName.value;

        const characterRace = document.getElementById('formInputCharacterRace');
        const character_race = characterRace.value;

        const characterClass = document.getElementById('formInputCharacterClass');
        const character_class = characterClass.value;

        const characterBuild = document.getElementById('formInputCharacterBuild');
        const character_build = characterBuild.value;

        const characterLevel = document.getElementById('formInputCharacterLevel');
        const character_level = characterLevel.value;

        const characterSheet = document.getElementById('formInputCharacterSheet');
        const character_sheet = characterSheet.value;

        const characterImage = document.getElementById('formInputCharacterImage');
        const character_image = characterImage.value;

        // validation checks
        if (!character_name) {
            alert('Please enter a character name.');
            return;
        }

        if (!character_race) {
            alert('Please enter a character race.');
            return;
        }

        if (!character_class) {
            alert('Please enter a character class.');
            return;
        }

        if (!character_build) {
            alert('Please enter a character build.');
            return;
        }

        if (!character_level) {
            alert('Please enter a character level.');
            return;
        }

        if (!character_sheet) {
            alert('Please enter a character sheet file name.');
            return;
        }

        if (!character_image) {
            alert('Please enter a character image file name.');
            return;
        }

        const character = {
            character_name,
            character_race,
            character_class,
            character_build,
            character_level,
            character_sheet,
            character_image
        }; // assemble the new character parts
        const {
            newCharacter,
            newCharacterEl
        } = this._createNewCharacterEl(character); // add character to list

        this.addCharacter(newCharacter);

        const listParent = document.getElementById('characters-list');

        if (listParent) {
            listParent.appendChild(newCharacterEl);
        } else {
            this._renderList();
        }
        characterName.value = ''; // clear form text input
        characterRace.value = '';
        characterClass.value = '';
        characterBuild.value = '';
        characterLevel.value = '';
        characterSheet.value = '';
        characterImage.value = '';
    };

    /**
     * Create the DOM element for the new character with all its parts.
     *
     * @param {Object} character - { character_name, status } partial status object
     */
    _createNewCharacterEl = (character) => {
        const character_id = this.characters.length;
        const created_date = new Date().toISOString();
        const newCharacter = {
            ...character,
            character_id,
            created_date
        };
        const newCharacterEl = this._renderListRowItem(newCharacter);

        return {
            newCharacter,
            newCharacterEl
        };
    };

    /**
     * Pure function for deleting a character.
     *
     * @param {number} characterId - id for the character to be deleted
     */
    deleteCharacter = async (characterId) => {
        try {
            const res = await this.charactersService.deleteCharacter(characterId);
            this.characters = this.characters.filter((character) => character.character_id !== characterId);

            if (res !== null) {
                alert('Character deleted successfully!');
            }
            return res;
        } catch (err) {
            console.log(err);
            alert('Unable to delete Character. Please try again later.');
        }
    };

    /**
     * DOM Event handler helper for deleting a character from the DOM.
     * This relies on a pre-existing in the list of characters.
     *
     * @param {number} characterId - id of the character to delete
     */
    _deleteEventHandler = (characterId) => () => {
        const character = document.getElementById(`character-${characterId}`);
        character.remove();

        this.deleteCharacter(characterId).then(() => {
            if (!this.characters.length) {
                this._renderMsg();
            }
        });
    };

    /**
     * Creates a message div block.
     *
     * @param {string} msg - custom message to display
     */
    _createMsgElement = (msg) => {
        const msgDiv = document.createElement('div');
        const text = document.createTextNode(msg);
        msgDiv.id = 'user-message';
        msgDiv.className = 'center';
        msgDiv.appendChild(text);

        return msgDiv;
    };

    render = async () => {
        const characters = await this.charactersService.getCharacters();

        try {
            if (characters.length) {
                this.characters = characters;
                this._renderList();
            } else {
                this._renderMsg();
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };
}