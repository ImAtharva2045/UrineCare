
const express = require("express");
const router = express.Router();

const {
    approveReport,
    requestRevision
} = require("../controllers/reviewController");

const {
    protect,
    allowRoles
} = require("../middleware/authMiddleware");

// Approving and requesting revisions require a Doctor role
router.use(protect, allowRoles("Doctor"));

// Approve a report
router.patch("/:id/approve", approveReport);

// Request corrections
router.patch("/:id/revision", requestRevision);

module.exports = router;
