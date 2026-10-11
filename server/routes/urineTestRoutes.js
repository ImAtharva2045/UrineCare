
const express = require("express");
const router = express.Router();

const {
  createUrineTest,
  getUrineTests,
  getUrineTestById,
  submitForReview
} = require("../controllers/urineTestController");

const {
    protect,
    allowRoles
} = require("../middleware/authMiddleware");

// Require authentication for every urine test route
router.use(protect);

// View all urine test reports
router.get(
    "/",
    allowRoles("Admin", "Technician", "Doctor"),
    getUrineTests
);


router.patch(
  "/:id/submit",
  allowRoles("Admin", "Technician"),
  submitForReview
);
// Create a urine test report
router.post(
    "/",
    allowRoles("Admin", "Technician"),
    createUrineTest
);



// View an individual urine test report
router.get(
    "/:id",
    allowRoles("Admin", "Technician", "Doctor"),
    getUrineTestById
);

module.exports = router;
