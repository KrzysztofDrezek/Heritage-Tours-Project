const db = require("../db/connection");

function createBooking(tourID, theDate, username, visitors) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO bookings (tourID, theDate, username, visitors)
            VALUES (?, ?, ?, ?)
        `;

        db.run(sql, [tourID, theDate, username, visitors], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    id: this.lastID,
                    tourID,
                    theDate,
                    username,
                    visitors
                });
            }
        });
    });
}

function getAllBookings() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT *
            FROM bookings
            ORDER BY id DESC
        `;

        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getBookingsByUsername(username) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT *
            FROM bookings
            WHERE username = ?
            ORDER BY id DESC
        `;

        db.all(sql, [username], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getBookingById(id) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT *
            FROM bookings
            WHERE id = ?
        `;

        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function deleteBooking(id) {
    return new Promise((resolve, reject) => {
        const sql = `
            DELETE FROM bookings
            WHERE id = ?
        `;

        db.run(sql, [id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    deleted: this.changes > 0
                });
            }
        });
    });
}

module.exports = {
    createBooking,
    getAllBookings,
    getBookingsByUsername,
    getBookingById,
    deleteBooking
};