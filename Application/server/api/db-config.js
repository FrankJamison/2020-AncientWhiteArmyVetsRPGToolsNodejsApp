let mysql;
try {
    mysql = require('mysql2');
} catch (e) {
    // Fallback for older environments.
    mysql = require('mysql');
}
const {
    CREATE_USERS_TABLE
} = require('./queries/user.queries');
const {
    CREATE_CHARACTER_TABLE
} = require('./queries/character.queries');
const {
    CREATE_TASKS_TABLE
} = require('./queries/tasks.queries');
const query = require('./utils/query');

const host = process.env.DB_HOST || 'localhost';
const port = Number(process.env.DB_PORT) || 3306;
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASS || '';
const database = process.env.DB_DATABASE || 'ancientwhitearmyvet';
const connectTimeout = Number(process.env.DB_CONNECT_TIMEOUT_MS) || 10000;
const socketPath = process.env.DB_SOCKET_PATH || process.env.DB_SOCKET || null;

let _schemaBootstrapped = false;

const _ensureSchema = async (con) => {
    if (_schemaBootstrapped) return;

    await query(con, CREATE_USERS_TABLE).catch((err) => {
        console.log('schema users failed:', err && err.message ? err.message : err);
    });

    await query(con, CREATE_TASKS_TABLE).catch((err) => {
        console.log('schema tasks failed:', err && err.message ? err.message : err);
    });

    await query(con, CREATE_CHARACTER_TABLE).catch((err) => {
        console.log(
            'schema characters failed:',
            err && err.message ? err.message : err
        );
    });

    _schemaBootstrapped = true;
};

const _connect = async (dbName) =>
    new Promise((resolve, reject) => {
        const connectionOptions = {
            user,
            password,
            connectTimeout,
            ...(dbName ? { database: dbName } : {}),
        };

        // If a socket is provided, force socket connectivity and avoid TCP.
        // On some shared hosts, TCP to 127.0.0.1/localhost:3306 may be blocked or not running.
        if (socketPath) {
            connectionOptions.socketPath = socketPath;
        } else {
            connectionOptions.host = host;
            connectionOptions.port = port;
        }

        const con = mysql.createConnection(connectionOptions);

        con.connect((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(con);
        });
    });

const connection = async () => {
    try {
        const con = await _connect(database);
        await _ensureSchema(con);
        return con;
    } catch (err) {
        if (err && err.code === 'ER_BAD_DB_ERROR') {
            const bootstrapCon = await _connect(null);
            await query(bootstrapCon, `CREATE DATABASE IF NOT EXISTS \`${database}\``);
            try {
                bootstrapCon.end();
            } catch (e) {
                // ignore
            }
            const con = await _connect(database);
            await _ensureSchema(con);
            return con;
        }

        throw err;
    }
};

(async () => {
    try {
        // Trigger schema bootstrap early (but it will also run lazily on demand).
        await connection();
    } catch (err) {
        console.error('DB init failed:', err && err.message ? err.message : err);
    }
})();

module.exports = connection;