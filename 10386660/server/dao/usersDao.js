const db = require("../db/connection");

function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT *
            FROM users
            WHERE username = ?
        `;

        db.get(sql, [username], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

module.exports = {
    getUserByUsername
};