const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  markAttendance,
  getClassAttendance,
  getStudentAttendance,
} = require("../controllers/attendanceController");

router.use(protect);

router.post("/", markAttendance);
router.get("/class", getClassAttendance);
router.get("/student/:studentId", getStudentAttendance);

module.exports = router;
