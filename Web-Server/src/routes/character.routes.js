const express = require('express');
const {
    getAllCharacters,
    createCharacter,
    getCharacter,
    updateCharacter,
    deleteCharacter,
} = require('../controllers/character.controller');
const canAccess = require('../middleware/auth.middleware');

const characterRoutes = express.Router();
/**
 * Express routes for Characters.
 *
 * RESTful endpoints make for easily adding to existing API features.
 */

/**
 * Routes for all characterss. Evaluates to `/characters/`.
 */
characterRoutes.get('/', canAccess, getAllCharacters).post('/', canAccess, createCharacter);

/**
 * Routes for a character by id. Evalutes to `/characters/:characterId`.
 */
characterRoutes
    .get('/:characterId', canAccess, getCharacter) // GET http://locahost:3000/characters/1
    .put('/:characterId', canAccess, updateCharacter)
    .delete('/:characterId', canAccess, deleteCharacter);

module.exports = characterRoutes;