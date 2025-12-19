const express = require('express');
const verify = require('../middleware/auth.middleware');
const {
    getMe,
    updateMe
} = require('../controllers/user.controller');

const userRoutes = express.Router();

userRoutes.get('/me', verify, getMe);
userRoutes.put('/me', verify, updateMe);

module.exports = userRoutes;