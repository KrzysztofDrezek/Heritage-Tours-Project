const bookingsDao = require("../dao/bookingsDao");
const availabilityDao = require("../dao/availabilityDao");

async function createBooking(req, res) {
    try {
        const { tourID, theDate, visitors } = req.body;
        const sessionUsername = req.session.user.username;

        const availability = await availabilityDao.getAvailabilityByTourAndDate(
            Number(tourID),
            theDate
        );

        if (!availability) {
            return res.status(404).json({
                error: "No availability found for the selected tour and date"
            });
        }

        if (availability.maxPlaces < Number(visitors)) {
            return res.status(409).json({
                error: `Only ${availability.maxPlaces} places are available for this date`
            });
        }

        const booking = await bookingsDao.createBooking(
            Number(tourID),
            theDate,
            sessionUsername,
            Number(visitors)
        );

        const newMaxPlaces = availability.maxPlaces - Number(visitors);
        await availabilityDao.updateMaxPlaces(availability.id, newMaxPlaces);

        res.status(201).json({
            message: "Booking created successfully",
            booking,
            remainingPlaces: newMaxPlaces
        });
    } catch (error) {
        console.error("Error creating booking:", error.message);
        res.status(500).json({ error: "Failed to create booking" });
    }
}

async function getAllBookings(req, res) {
    try {
        const bookings = await bookingsDao.getAllBookings();
        res.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error.message);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
}

async function getBookingsByUsername(req, res) {
    try {
        const username = req.params.username;
        const bookings = await bookingsDao.getBookingsByUsername(username);
        res.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings by username:", error.message);
        res.status(500).json({ error: "Failed to fetch bookings by username" });
    }
}

async function deleteBooking(req, res) {
    try {
        const bookingId = Number(req.params.id);
        const sessionUser = req.session.user;

        const booking = await bookingsDao.getBookingById(bookingId);

        if (!booking) {
            return res.status(404).json({
                error: "Booking not found"
            });
        }

        if (booking.username !== sessionUser.username && sessionUser.role !== "admin") {
            return res.status(403).json({
                error: "You are not allowed to delete this booking"
            });
        }

        const availability = await availabilityDao.getAvailabilityByTourAndDate(
            Number(booking.tourID),
            booking.theDate
        );

        if (!availability) {
            return res.status(404).json({
                error: "Matching availability record not found"
            });
        }

        const restoredPlaces = availability.maxPlaces + Number(booking.visitors);

        await availabilityDao.updateMaxPlaces(availability.id, restoredPlaces);
        await bookingsDao.deleteBooking(bookingId);

        res.json({
            message: "Booking deleted successfully",
            restoredPlaces
        });
    } catch (error) {
        console.error("Error deleting booking:", error.message);
        res.status(500).json({ error: "Failed to delete booking" });
    }
}

module.exports = {
    createBooking,
    getAllBookings,
    getBookingsByUsername,
    deleteBooking
};