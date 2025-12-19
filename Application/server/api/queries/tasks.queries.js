exports.CREATE_TASKS_TABLE = `CREATE TABLE IF NOT EXISTS tasks(
  task_id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  task_name varchar(255) NOT NULL,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP(),
  status varchar(10) DEFAULT 'pending',
  PRIMARY KEY (task_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
)`;

exports.ALL_TASKS = (userId) => `SELECT * FROM tasks WHERE user_id = ${userId}`;

exports.SINGLE_TASK = (userId, taskId) =>
    `SELECT * FROM tasks WHERE user_id = ${userId} AND task_id = ${taskId}`;

exports.INSERT_TASK = (userId, taskName) =>
    `INSERT INTO tasks (user_id, task_name) VALUES (${userId}, ${taskName})`;

exports.UPDATE_TASK = (userId, taskId, newValues) =>
    `UPDATE tasks SET ${newValues} WHERE user_id = ${userId} AND task_id = ${taskId}`;

exports.DELETE_TASK = (userId, taskId) =>
    `DELETE FROM tasks WHERE user_id = ${userId} AND task_id = ${taskId}`;