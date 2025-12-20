const mysql = require('mysql');
const {
    CREATE_USERS_TABLE
} = require('./queries/user.queries');
const {
    CREATE_CHARACTER_TABLE
} = require('./queries/character.queries');
const query = require('./utils/query');

const envOr = (...names) => {
    for (const name of names) {
        const val = process.env[name];
        if (val !== undefined && val !== null && String(val).trim() !== '') return val;
    }
    return undefined;
};

// Get the Host from Environment or use default
const host = envOr('DB_HOST', 'APP_DB_HOST', 'MYSQL_HOST', 'DB_HOSTNAME');

// Get the Port for DB from Environment or use default
const port = Number(process.env.DB_PORT) || 3306;

// Get the User for DB from Environment or use default
// NOTE: Defaulting to 'root' matches common local MySQL/XAMPP setups.
const user = envOr('DB_USER', 'DB_USERNAME', 'MYSQL_USER') || 'root';

// Get the Password for DB from Environment or use default
// NOTE: Many local MySQL installs (e.g., XAMPP) default to a blank password.
const password = envOr('DB_PASS', 'DB_PASSWORD', 'MYSQL_PASSWORD') || '';

// Get the Database from Environment or use default
const database = envOr('DB_DATABASE', 'DB_NAME', 'MYSQL_DATABASE') || 'ancientwhitearmyvet';

const connectionLimit = Number(envOr('DB_CONN_LIMIT', 'MYSQL_CONN_LIMIT')) || 10;

const _connect = async (dbName) =>
    new Promise((resolve, reject) => {
        if (!host) {
            reject(new Error('Missing DB_HOST (or APP_DB_HOST) environment variable'));
            return;
        }

        const con = mysql.createConnection({
            host,
            user,
            password,
            port,
            ...(dbName ? {
                database: dbName
            } : {}),
        });

        con.connect((err) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(con);
        });
    });

const _createPool = (dbName) => {
    if (!host) throw new Error('Missing DB_HOST (or APP_DB_HOST) environment variable');
    return mysql.createPool({
        host,
        user,
        password,
        port,
        connectionLimit,
        ...(dbName ? {
            database: dbName,
        } : {}),
    });
};

let pool;

const connection = async () => {
    try {
        if (!pool) {
            pool = _createPool(database);
        }

        // Validate the pool can talk to the DB.
        await query(pool, 'SELECT 1');
        return pool;
    } catch (err) {
        // If the DB doesn't exist yet, try to create it and rebuild the pool.
        if (err && err.code === 'ER_BAD_DB_ERROR') {
            const bootstrapCon = await _connect(null);
            await query(bootstrapCon, `CREATE DATABASE IF NOT EXISTS \`${database}\``);
            try {
                bootstrapCon.end();
            } catch (e) {
                // ignore
            }

            pool = _createPool(database);
            await query(pool, 'SELECT 1');
            return pool;
        }

        throw err;
    }
};

// Create the connection with required details
(async () => {
    try {
        const _con = await connection();

        const userTableCreated = await query(_con, CREATE_USERS_TABLE).catch(
            (err) => {
                console.log(err);
            }
        );

        const characterTableCreated = await query(_con, CREATE_CHARACTER_TABLE).catch(
            (err) => {
                console.log(err);
            }
        );

        if (!!userTableCreated) {
            console.log('User table Created!');
        }

        if (!!characterTableCreated) {
            console.log('Character table created!');
        }
    } catch (err) {
        console.error('DB init failed:', err && err.message ? err.message : err);
    }
})();

module.exports = connection;