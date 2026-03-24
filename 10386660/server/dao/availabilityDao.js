const db = require("../db/connection");

function getAvailabilityByTourId(tourId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, tourID, theDate, maxPlaces
            FROM availability
            WHERE tourID = ?
            ORDER BY theDate
        `;

        db.all(sql, [tourId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getAvailabilityByTourAndDate(tourID, theDate) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, tourID, theDate, maxPlaces
            FROM availability
            WHERE tourID = ? AND theDate = ?
        `;

        db.get(sql, [tourID, theDate], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function updateMaxPlaces(id, newMaxPlaces) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE availability
            SET maxPlaces = ?
            WHERE id = ?
        `;

        db.run(sql, [newMaxPlaces, id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    updated: this.changes > 0
                });
            }
        });
    });
}

module.exports = {
    getAvailabilityByTourId,
    getAvailabilityByTourAndDate,
    updateMaxPlaces
};