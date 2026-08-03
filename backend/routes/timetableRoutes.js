const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addSchedule,
  getClassSchedules,
  deleteSchedule,
} = require("../controllers/timetableController");

router.use(protect);

router.post("/", addSchedule);
router.get("/:studentClass", getClassSchedules);
router.delete("/:id", deleteSchedule);

module.exports = router;
