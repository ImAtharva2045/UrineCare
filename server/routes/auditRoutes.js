
const express = require("express");
const router = express.Router();

const { getAuditLogs } = require("../controllers/auditController");
const { protect, allowRoles } = require("../middleware/authMiddleware");

// Only Admins can access audit logs
router.get("/", protect, allowRoles("Admin"), getAuditLogs);

module.exports = router;
