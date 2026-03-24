const availabilityDao = require("../dao/availabilityDao");

async function getAvailabilityByTourId(req, res) {
    try {
        const tourId = req.params.tourId;

        const availability = await availabilityDao.getAvailabilityByTourId(tourId);
        res.json(availability);
    } catch (error) {
        console.error("Error fetching availability:", error.message);
        res.status(500).json({ error: "Failed to fetch availability" });
    }
}

module.exports = {
    getAvailabilityByTourId
};