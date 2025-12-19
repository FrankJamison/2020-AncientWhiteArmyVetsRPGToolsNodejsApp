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

exports.ALL_CHARACTERS = () =>
    `SELECT * FROM characters ORDER BY character_class, character_level, character_build, character_race, character_name`;

exports.SINGLE_CHARACTER = (characterId) =>
    `SELECT * FROM characters WHERE character_id = ${characterId}`;

exports.INSERT_CHARACTER = (
        characterName,
        characterRace,
        characterClass,
        characterBuild,
        characterLevel,
        characterSheet,
        characterImage
    ) =>
    `INSERT INTO characters (character_name,character_race,character_class,character_build,character_level,character_sheet,character_image) VALUES (${characterName},${characterRace},${characterClass},${characterBuild},${characterLevel},${characterSheet},${characterImage})`;

exports.UPDATE_CHARACTER = (characterId, newValues) =>
    `UPDATE characters SET ${newValues} WHERE character_id = ${characterId}`;

exports.DELETE_CHARACTER = (characterId) =>
    `DELETE FROM characters WHERE character_id = ${characterId}`;