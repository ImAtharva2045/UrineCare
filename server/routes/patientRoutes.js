
const express = require("express");
const router = express.Router();
const { protect, allowRoles } = require("../middleware/authMiddleware");

const {
    createPatient,
    getNextPatientId,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient
} = require("../controllers/patientController");


// Every patient route requires login
router.use(protect);

// Get next auto-incremented patient ID (UC-P-XXXX)
router.get("/next-id", allowRoles("Admin", "Technician"), getNextPatientId);

// Admins and technicians can register patients
router.route("/")
    .get(allowRoles("Admin", "Technician", "Doctor"), getPatients)
    .post(allowRoles("Admin", "Technician"), createPatient);

// Only authorised staff can view or update individual records
router.route("/:id")
    .get(allowRoles("Admin", "Technician", "Doctor"), getPatientById)
    .put(allowRoles("Admin", "Technician"), updatePatient)
    .delete(allowRoles("Admin"), deletePatient);

module.exports = router;
