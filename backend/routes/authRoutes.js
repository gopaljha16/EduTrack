const express = require("express");
const router = express.Router();
const { register, login, getMe, updatePassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/update-password", protect, updatePassword);

// Admin-only: create new users (requires login)
router.post("/register", protect, register);

module.exports = router;
