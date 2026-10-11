
const express = require("express");
const router = express.Router();

const { createUser } = require("../controllers/userController");

const {
    protect,
    allowRoles
} = require("../middleware/authMiddleware");

// Only logged-in Admins can create staff accounts
router.post(
    "/",
    protect,
    allowRoles("Admin"),
    createUser
);

module.exports = router;
