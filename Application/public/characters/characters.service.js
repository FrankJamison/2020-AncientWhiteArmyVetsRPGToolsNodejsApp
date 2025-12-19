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
     *Gets the currently selected class from the form so that the displayed results can be filtered.
     *
     * @memberof CharacterList
     */
    getRequestedCharacterClass = () => {
        const classSelect = document.getElementById('class');
        const classOptions = classSelect.options;
        const selectedClass = classSelect.selectedIndex;
        const classStatus = classOptions[selectedClass].text;
        return classStatus;
    }

    /**
     *  Gets the currently selected character level from th eform so that the displayed results can be filteres
     *
     * @memberof CharacterList
     */
    getRequestedCharacterLevel = () => {
        const levelSelect = document.getElementById('level');
        const levelOptions = levelSelect.options;
        const selectedLevel = levelSelect.selectedIndex;
        const levelStatus = levelOptions[selectedLevel].value;
        return levelStatus;
    }

    _matchesCurrentSelection = (character) => {
        const requestedClass = this.getRequestedCharacterClass();
        const requestedLevel = this.getRequestedCharacterLevel();

        return (
            character?.character_class?.toString() === requestedClass?.toString() &&
            character?.character_level?.toString() === requestedLevel?.toString()
        );
    };

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
        characterCard.appendChild(characterContent);
        characterItem.appendChild(characterCard);

        return characterItem;
    };

    /**
     * DOM renderer for assembling the list items then mounting them to a parent node.
     */
    _renderList = () => {
        // get the "Loading..." text node from parent element
        const charactersDiv = document.getElementById('characters');
        const loadingDiv = charactersDiv.childNodes[1];
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

    /**
     * DOM renderer for displaying a default message when a user has an empty list.
     */
    _renderMsg = (msg = 'No characters found for that selection.') => {
        const charactersDiv = document.getElementById('characters');
        if (!charactersDiv) return;

        const listParent = document.getElementById('characters-list');
        const msgDiv = this._createMsgElement(msg);
        const replaceTarget = listParent || charactersDiv.querySelector('div') || charactersDiv.firstChild;

        if (replaceTarget) {
            charactersDiv.replaceChild(msgDiv, replaceTarget);
        } else {
            charactersDiv.appendChild(msgDiv);
        }
    };

    render = async () => {
        try {
            const characters = await this.charactersService.getCharacters();

            if (!Array.isArray(characters) || !characters.length) {
                this._renderMsg();
                return;
            }

            const filteredCharacters = characters.filter((c) => this._matchesCurrentSelection(c));
            if (!filteredCharacters.length) {
                this._renderMsg();
                return;
            }

            this.characters = filteredCharacters;
            this._renderList();
        } catch (err) {
            alert(`Error: ${err && err.message ? err.message : err}`);
        }
    };
}