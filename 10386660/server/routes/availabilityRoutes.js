const express = require("express");
const router = express.Router();
const availabilityController = require("../controllers/availabilityController");

router.get("/tour/:tourId", availabilityController.getAvailabilityByTourId);

module.exports = router;