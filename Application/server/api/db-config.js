const mysql = require('mysql');
const {
    CREATE_USERS_TABLE
} = require('./queries/user.queries');
const {
    CREATE_CHARACTER_TABLE
} = require('./queries/character.queries');
const query = require('./utils/query');

// Get the Host from Environment or use default
const host = process.env.DB_HOST || process.env.APP_DB_HOST;

// Get the Port for DB from Environment or use default
const port = Number(process.env.DB_PORT) || 3306;

// Get the User for DB from Environment or use default
// NOTE: Defaulting to 'root' matches common local MySQL/XAMPP setups.
const user = process.env.DB_USER || 'root';

// Get the Password for DB from Environment or use default
// NOTE: Many local MySQL installs (e.g., XAMPP) default to a blank password.
const password = process.env.DB_PASS || '';

// Get the Database from Environment or use default
const database = process.env.DB_DATABASE || 'ancientwhitearmyvet';

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

const connection = async () => {
    try {
        return await _connect(database);
    } catch (err) {
        // If the DB doesn't exist yet, create it and retry.
        if (err && err.code === 'ER_BAD_DB_ERROR') {
            const bootstrapCon = await _connect(null);
            await query(bootstrapCon, `CREATE DATABASE IF NOT EXISTS \`${database}\``);
            try {
                bootstrapCon.end();
            } catch (e) {
                // ignore
            }
            return await _connect(database);
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
