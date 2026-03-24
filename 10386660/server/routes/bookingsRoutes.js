const express = require("express");
const router = express.Router();
const bookingsController = require("../controllers/bookingsController");
const {
    requireLogin,
    requireSameUserOrAdmin
} = require("../middleware/authMiddleware");
const {
    validateBooking
} = require("../middleware/bookingValidationMiddleware");

router.get("/user/:username", requireLogin, requireSameUserOrAdmin, bookingsController.getBookingsByUsername);
router.get("/", bookingsController.getAllBookings);
router.post("/", requireLogin, validateBooking, bookingsController.createBooking);
router.delete("/:id", requireLogin, bookingsController.deleteBooking);

module.exports = router;