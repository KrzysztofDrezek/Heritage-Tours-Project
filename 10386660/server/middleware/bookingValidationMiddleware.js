function getTodayAsYYMMDD() {
    const today = new Date();
    const year = String(today.getFullYear()).slice(-2);
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
}

function isValidYYMMDD(dateString) {
    return /^\d{6}$/.test(dateString);
}

function validateBooking(req, res, next) {
    const { tourID, theDate, username, visitors } = req.body;
    const sessionUsername = req.session?.user?.username;

    if (!tourID || !theDate || !username || !visitors) {
        return res.status(400).json({
            error: "tourID, theDate, username and visitors are required"
        });
    }

    if (!sessionUsername) {
        return res.status(403).json({
            error: "You must be logged in to make a booking"
        });
    }

    if (username !== sessionUsername) {
        return res.status(403).json({
            error: "You can only create bookings for your own account"
        });
    }

    if (!isValidYYMMDD(theDate)) {
        return res.status(400).json({
            error: "theDate must be in YYMMDD format"
        });
    }

    if (!Number.isInteger(Number(visitors)) || Number(visitors) < 1) {
        return res.status(400).json({
            error: "visitors must be a whole number of at least 1"
        });
    }

    const todayYYMMDD = getTodayAsYYMMDD();

    if (theDate < todayYYMMDD) {
        return res.status(400).json({
            error: "Bookings for past dates are not allowed"
        });
    }

    next();
}

module.exports = {
    validateBooking
};