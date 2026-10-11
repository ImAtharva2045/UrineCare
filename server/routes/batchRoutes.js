
const express = require("express");
const router = express.Router();

const {
    createBatch,
    getBatches
} = require("../controllers/batchController");

const {
    protect,
    allowRoles
} = require("../middleware/authMiddleware");

// All inventory routes require authentication
router.use(protect);

// View inventory: Admin, Technician and Doctor
router.get(
    "/",
    allowRoles("Admin", "Technician", "Doctor"),
    getBatches
);

// Create inventory batches: Admin only
router.post(
    "/",
    allowRoles("Admin"),
    createBatch
);

module.exports = router;
