const bcrypt = require('bcryptjs');

const connection = require('../db-config');
const query = require('../utils/query');
const {
    GET_ME_BY_USER_ID,
    GET_ME_BY_USER_ID_WITH_PASSWORD,
    UPDATE_USER,
} = require('../queries/user.queries');

exports.getMe = async (req, res) => {
    const user = req.user;

    if (user.id) {
        const con = await connection().catch((err) => {
            throw err;
        });

        const me = await query(con, GET_ME_BY_USER_ID, [user.id]).catch(() => {
            res.status(500).json({
                msg: 'Could not find the user.',
            });
        });

        if (!me || !me.length) {
            return res.status(400).json({
                msg: 'No user found.',
            });
        }
        return res.status(200).send(me);
    }
};

exports.updateMe = async function(req, res) {
    const con = await connection().catch((err) => {
        throw err;
    });

    const me = await query(con, GET_ME_BY_USER_ID_WITH_PASSWORD, [req.user.id]).catch(
        () => {
            res.status(500);
            res.json({
                msg: 'Could not retrieve user.',
            });
        }
    );

    const passwordUnchanged = await bcrypt.compare(req.body.password, me[0].password).catch(
        () => {
            res.status(500).json({
                msg: 'Invalid password!',
            });
        }
    );

    if (!passwordUnchanged) {
        const passwordHash = bcrypt.hashSync(req.body.password);

        const result = await query(con, UPDATE_USER, [
            req.body.username,
            req.body.email,
            passwordHash,
            me[0].id,
        ]).catch(() => {
            res.status(500).json({
                msg: 'Could not update user settings.',
            });
        });

        if (result && result.affectedRows === 1) {
            return res.json({
                msg: 'Updated succesfully!',
            });
        }

        return res.json({
            msg: 'Nothing to update...',
        });
    }
};