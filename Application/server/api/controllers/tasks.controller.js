const mysql = require('mysql');
const connection = require('../db-config');
const {
    ALL_TASKS,
    SINGLE_TASK,
    INSERT_TASK,
    UPDATE_TASK,
    DELETE_TASK,
} = require('../queries/tasks.queries');
const query = require('../utils/query');
const {
    serverError
} = require('../utils/handlers');

exports.getAllTasks = async (req, res) => {
    const con = await connection().catch((err) => {
        throw err;
    });

    const tasks = await query(con, ALL_TASKS(req.user.id), []).catch(serverError(res));

    if (!tasks.length) {
        return res.status(200).json({
            msg: 'No tasks available for this user.',
        });
    }
    return res.json(tasks);
};

exports.getTask = async (req, res) => {
    const con = await connection().catch((err) => {
        throw err;
    });

    const task = await query(con, SINGLE_TASK(req.user.id, req.params.taskId)).catch(
        serverError(res)
    );

    if (!task.length) {
        return res.status(400).json({
            msg: 'No tasks available for this user.',
        });
    }
    return res.json(task);
};

exports.createTask = async (req, res) => {
    const user = req.user;

    if (user.id) {
        const con = await connection().catch((err) => {
            throw err;
        });

        const taskName = mysql.escape(req.body.task_name);
        const result = await query(con, INSERT_TASK(user.id, taskName)).catch(serverError(res));

        if (result.affectedRows !== 1) {
            return res.status(500).json({
                msg: `Unable to add task: ${req.body.task_name}`,
            });
        }
        return res.json({
            msg: 'Added task successfully!',
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

exports.updateTask = async (req, res) => {
    const con = await connection().catch((err) => {
        throw err;
    });
    const values = _buildValuesString(req);

    const result = await query(con, UPDATE_TASK(req.user.id, req.params.taskId, values)).catch(
        serverError(res)
    );

    if (result.affectedRows !== 1) {
        return res.status(500).json({
            msg: `Unable to update task: '${req.body.task_name}'`,
        });
    }
    return res.json(result);
};

exports.deleteTask = async (req, res) => {
    const con = await connection().catch((err) => {
        throw err;
    });

    const result = await query(con, DELETE_TASK(req.user.id, req.params.taskId)).catch(
        serverError(res)
    );

    if (result.affectedRows !== 1) {
        return res.status(500).json({
            msg: `Unable to delete task at: ${req.params.taskId}`,
        });
    }
    return res.json({
        msg: 'Deleted successfully.',
    });
};