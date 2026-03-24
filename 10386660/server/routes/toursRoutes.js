const express = require("express");
const router = express.Router();
const toursController = require("../controllers/toursController");
const { requireAdmin } = require("../middleware/authMiddleware");

router.get("/search", toursController.getToursByCityAndTheme);
router.get("/city/:city", toursController.getToursByCity);
router.get("/", toursController.getAllTours);
router.post("/", requireAdmin, toursController.createTour);
router.delete("/:id", requireAdmin, toursController.deleteTour);

module.exports = router;