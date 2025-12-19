const mysql = require('mysql');
const {
    CREATE_USERS_TABLE
} = require('./queries/user.queries');
const {
    CREATE_CHARACTER_TABLE
} = require('./queries/character.queries');
const query = require('./utils/query');

const host = process.env.DB_HOST || 'localhost';
const port = Number(process.env.DB_PORT) || 3306;
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASS || '';
const database = process.env.DB_DATABASE || 'ancientwhitearmyvet';

const _connect = async (dbName) =>
    new Promise((resolve, reject) => {
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

(async () => {
    try {
        const con = await connection();

        const userTableCreated = await query(con, CREATE_USERS_TABLE).catch((err) => {
            console.log(err);
        });

        const characterTableCreated = await query(con, CREATE_CHARACTER_TABLE).catch(
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