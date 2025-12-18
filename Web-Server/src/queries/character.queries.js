/**
 * Tables follow syntax:
 * - CREATE TABLE <table_name>(<column_name> <data_type> <options>, ...)
 *character
 * Create a table called `characters` (case-insensitive), with
 * - id as an integer/number that can't have null values, auto-increment it
 * - name with a max of 255 characters, cannot have null values
 * - created_date set to date and time created
 * - status with a max of 10 characters, has a default of 'pending'
 *
 * NOTE: order is important.
 * - columns can have multiple options attached (take `id` column for example)
 * - id is always first (helps with inserting)
 * - defaults always specifed last (helps with inserting)
 */
exports.CREATE_CHARACTER_TABLE = `CREATE TABLE IF NOT EXISTS characters(
    character_id int NOT NULL AUTO_INCREMENT,
    character_name varchar(255) NOT NULL,
    character_race varchar(255) NOT NULL,
    character_class varchar(255) NOT NULL,
    character_build varchar(255) NOT NULL,
    character_level int NOT NULL,
    character_sheet varchar(255) NOT NULL,
    character_image varchar(255) NOT NULL,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (character_id)
  )`;


// Get all characters
exports.ALL_CHARACTERS = () => `SELECT * FROM characters ORDER BY character_class, character_level, character_build, character_race, character_name`;

// Get Character by id
exports.SINGLE_CHARACTER = (characterId) =>
    `SELECT * FROM characters WHERE character_id = ${characterId}`;

/**
 * Insert follows syntax:
 * - INSERT INTO <table_name>(<col_name1>, <col_name3>, <col_name3>, ...)
 *    VALUES(<value1>, <value2>, <value3>, ...)
 *
 * Create a new character in `characters` table where
 * - column names match the order the are in the table
 * - `?` allow us to use params in our controllers
 */
// Insert a character
exports.INSERT_CHARACTER = (characterName, characterRace, characterClass, characterBuild, characterLevel, characterSheet, characterImage) =>
    `INSERT INTO characters (character_name,character_race,character_class,character_build,character_level,character_sheet,character_image) VALUES (${characterName},${characterRace},${characterClass},${characterBuild},${characterLevel},${characterSheet},${characterImage})`;

/**
 * Update follows syntax:
 * - UPDATE <table_name> SET <colum_name> = '<new_value>' WHERE <colum_name> = '<old_value>'
 *
 * NOTE: omitting `WHERE` will result in updating every existing entry.
 */
exports.UPDATE_CHARACTER = (characterId, newValues) =>
    `UPDATE characters SET ${newValues} WHERE character_id = ${characterId}`;

// Delete a character by id
exports.DELETE_CHARACTER = (characterId) =>
    `DELETE FROM characters WHERE character_id = ${characterId}`;