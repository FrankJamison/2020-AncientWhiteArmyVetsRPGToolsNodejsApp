const express = require('express');
const verify = require('../middleware/auth.middleware');
const {
    getAllCharacters,
    getCharacter,
    createCharacter,
    updateCharacter,
    deleteCharacter,
} = require('../controllers/character.controller');

const characterRoutes = express.Router();

characterRoutes.get('/', verify, getAllCharacters);
characterRoutes.get('/:characterId', verify, getCharacter);
characterRoutes.post('/', verify, createCharacter);
characterRoutes.put('/:characterId', verify, updateCharacter);
characterRoutes.delete('/:characterId', verify, deleteCharacter);

module.exports = characterRoutes;