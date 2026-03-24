const db = require("../db/connection");

function getAllTours() {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM tours";

        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getToursByCity(city) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT *
            FROM tours
            WHERE LOWER(city) = LOWER(?)
        `;

        db.all(sql, [city], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getToursByCityAndTheme(city, theme) {
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM tours";
        const conditions = [];
        const params = [];

        if (city !== "") {
            conditions.push("LOWER(city) LIKE LOWER(?)");
            params.push(`%${city}%`);
        }

        if (theme !== "") {
            conditions.push("LOWER(theme) LIKE LOWER(?)");
            params.push(`%${theme}%`);
        }

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function createTour(title, city, theme, latitude, longitude, description) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO tours (title, city, theme, latitude, longitude, description)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(sql, [title, city, theme, latitude, longitude, description], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    id: this.lastID,
                    title,
                    city,
                    theme,
                    latitude,
                    longitude,
                    description
                });
            }
        });
    });
}

function createAvailabilityRecords(tourID, dates, maxPlaces) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO availability (tourID, theDate, maxPlaces)
            VALUES (?, ?, ?)
        `;

        const stmt = db.prepare(sql);

        for (const date of dates) {
            stmt.run([tourID, date, maxPlaces]);
        }

        stmt.finalize((err) => {
            if (err) {
                reject(err);
            } else {
                resolve({ created: true });
            }
        });
    });
}

function countBookingsForTour(tourID) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT COUNT(*) AS total
            FROM bookings
            WHERE tourID = ?
        `;

        db.get(sql, [tourID], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.total);
            }
        });
    });
}

function deleteAvailabilityByTourId(tourID) {
    return new Promise((resolve, reject) => {
        const sql = `
            DELETE FROM availability
            WHERE tourID = ?
        `;

        db.run(sql, [tourID], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ deleted: this.changes > 0 });
            }
        });
    });
}

function deleteTour(tourID) {
    return new Promise((resolve, reject) => {
        const sql = `
            DELETE FROM tours
            WHERE id = ?
        `;

        db.run(sql, [tourID], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ deleted: this.changes > 0 });
            }
        });
    });
}

module.exports = {
    getAllTours,
    getToursByCity,
    getToursByCityAndTheme,
    createTour,
    createAvailabilityRecords,
    countBookingsForTour,
    deleteAvailabilityByTourId,
    deleteTour
};