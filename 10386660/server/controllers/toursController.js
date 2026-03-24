const toursDao = require("../dao/toursDao");

function isValidYYMMDD(dateString) {
    return /^\d{6}$/.test(dateString);
}

function getTodayAsYYMMDD() {
    const today = new Date();
    const year = String(today.getFullYear()).slice(-2);
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
}

function isWithinUK(latitude, longitude) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    return lat >= 49 && lat <= 61 && lng >= -9 && lng <= 2.5;
}

async function getAllTours(req, res) {
    try {
        const tours = await toursDao.getAllTours();
        res.json(tours);
    } catch (error) {
        console.error("Error fetching tours:", error.message);
        res.status(500).json({ error: "Failed to fetch tours" });
    }
}

async function getToursByCity(req, res) {
    try {
        const city = req.params.city;
        const tours = await toursDao.getToursByCity(city);
        res.json(tours);
    } catch (error) {
        console.error("Error fetching tours by city:", error.message);
        res.status(500).json({ error: "Failed to fetch tours by city" });
    }
}

async function getToursByCityAndTheme(req, res) {
    try {
        const city = req.query.city ? req.query.city.trim() : "";
        const theme = req.query.theme ? req.query.theme.trim() : "";

        const tours = await toursDao.getToursByCityAndTheme(city, theme);
        res.json(tours);
    } catch (error) {
        console.error("Error fetching tours by city and theme:", error.message);
        res.status(500).json({ error: "Failed to fetch tours by city and theme" });
    }
}

async function createTour(req, res) {
    try {
        const {
            title,
            city,
            theme,
            latitude,
            longitude,
            description,
            dates,
            maxPlaces
        } = req.body;

        if (
            !title ||
            !city ||
            !theme ||
            latitude === undefined ||
            longitude === undefined ||
            !description ||
            !Array.isArray(dates) ||
            dates.length === 0 ||
            !maxPlaces
        ) {
            return res.status(400).json({
                error: "title, city, theme, latitude, longitude, description, dates and maxPlaces are required"
            });
        }

        if (!isWithinUK(latitude, longitude)) {
            return res.status(400).json({
                error: "Coordinates must point to a location within the UK"
            });
        }

        if (!Number.isInteger(Number(maxPlaces)) || Number(maxPlaces) < 1) {
            return res.status(400).json({
                error: "maxPlaces must be a whole number of at least 1"
            });
        }

        const todayYYMMDD = getTodayAsYYMMDD();
        const cleanedDates = [...new Set(dates.map((date) => String(date).trim()))];

        for (const date of cleanedDates) {
            if (!isValidYYMMDD(date)) {
                return res.status(400).json({
                    error: "All dates must use YYMMDD format"
                });
            }

            if (date < todayYYMMDD) {
                return res.status(400).json({
                    error: "Dates in the past are not allowed"
                });
            }
        }

        const createdTour = await toursDao.createTour(
            title.trim(),
            city.trim(),
            theme.trim(),
            Number(latitude),
            Number(longitude),
            description.trim()
        );

        await toursDao.createAvailabilityRecords(
            createdTour.id,
            cleanedDates,
            Number(maxPlaces)
        );

        res.status(201).json({
            message: "Tour created successfully",
            tour: createdTour
        });
    } catch (error) {
        console.error("Error creating tour:", error.message);
        res.status(500).json({ error: "Failed to create tour" });
    }
}

async function deleteTour(req, res) {
    try {
        const tourID = Number(req.params.id);

        const bookingCount = await toursDao.countBookingsForTour(tourID);

        if (bookingCount > 0) {
            return res.status(409).json({
                error: "This tour cannot be deleted because it already has bookings"
            });
        }

        await toursDao.deleteAvailabilityByTourId(tourID);
        const result = await toursDao.deleteTour(tourID);

        if (!result.deleted) {
            return res.status(404).json({
                error: "Tour not found"
            });
        }

        res.json({
            message: "Tour deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting tour:", error.message);
        res.status(500).json({ error: "Failed to delete tour" });
    }
}

module.exports = {
    getAllTours,
    getToursByCity,
    getToursByCityAndTheme,
    createTour,
    deleteTour
};