const mysql = require('mysql');
const connection = require('../db-config');
const {
    ALL_CHARACTERS,
    SINGLE_CHARACTER,
    INSERT_CHARACTER,
    UPDATE_CHARACTER,
    DELETE_CHARACTER,
} = require('../queries/character.queries');
const query = require('../utils/query');
const {
    serverError
} = require('../utils/handlers');

exports.getAllCharacters = async (req, res) => {
    const con = await connection().catch((err) => {
        throw err;
    });

    const characters = await query(con, ALL_CHARACTERS(), []).catch(serverError(res));

    if (!characters.length) {
        return res.status(200).json([]);
    }
    return res.json(characters);
};

exports.getCharacter = async (req, res) => {
    const con = await connection().catch((err) => {
        throw err;
    });

    const character = await query(con, SINGLE_CHARACTER(req.params.characterId)).catch(
        serverError(res)
    );

    if (!character.length) {
        return res.status(404).json([]);
    }
    return res.json(character);
};

exports.createCharacter = async (req, res) => {
    const user = req.user;

    if (user.id) {
        const con = await connection().catch((err) => {
            throw err;
        });

        const characterName = mysql.escape(req.body.character_name);
        const characterRace = mysql.escape(req.body.character_race);
        const characterClass = mysql.escape(req.body.character_class);
        const characterBuild = mysql.escape(req.body.character_build);
        const characterLevel = mysql.escape(req.body.character_level);
        const characterSheet = mysql.escape(req.body.character_sheet);
        const characterImage = mysql.escape(req.body.character_image);

        const result = await query(
            con,
            INSERT_CHARACTER(
                characterName,
                characterRace,
                characterClass,
                characterBuild,
                characterLevel,
                characterSheet,
                characterImage
            )
        ).catch(serverError(res));

        if (result.affectedRows !== 1) {
            return res.status(500).json({
                msg: `Unable to add character: ${req.body.character_name}`,
            });
        }
        return res.json({
            msg: 'Added character successfully!',
        });
    }
};

const _buildValuesString = (req) => {
    const body = req.body;
    const values = Object.keys(body).map((key) => `${key} = ${mysql.escape(body[key])}`);

    values.push(`created_date = NOW()`);
    values.join(', ');
    return values;
};

exports.updateCharacter = async (req, res) => {
    const con = await connection().catch((err) => {
        throw err;
    });
    const values = _buildValuesString(req);

    const result = await query(con, UPDATE_CHARACTER(req.params.characterId, values)).catch(
        serverError(res)
    );

    if (result.affectedRows !== 1) {
        return res.status(500).json({
            msg: `Unable to update character: '${req.body.character_name}'`,
        });
    }
    return res.json(result);
};

exports.deleteCharacter = async (req, res) => {
    const con = await connection().catch((err) => {
        throw err;
    });

    const result = await query(con, DELETE_CHARACTER(req.params.characterId)).catch(
        serverError(res)
    );

    if (result.affectedRows !== 1) {
        return res.status(500).json({
            msg: `Unable to delete character at: ${req.params.characterId}`,
        });
    }
    return res.json({
        msg: 'Deleted successfully.',
    });
};