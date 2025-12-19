const express = require('express');
const verify = require('../middleware/auth.middleware');
const {
    getAllTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
} = require('../controllers/tasks.controller');

const tasksRoutes = express.Router();

tasksRoutes.get('/', verify, getAllTasks);
tasksRoutes.get('/:taskId', verify, getTask);
tasksRoutes.post('/', verify, createTask);
tasksRoutes.put('/:taskId', verify, updateTask);
tasksRoutes.delete('/:taskId', verify, deleteTask);

module.exports = tasksRoutes;