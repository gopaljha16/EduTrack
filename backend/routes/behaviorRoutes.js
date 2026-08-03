const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addBehaviorLog,
  getStudentBehaviorLogs,
  deleteBehaviorLog,
} = require("../controllers/behaviorController");

router.use(protect);

router.post("/", addBehaviorLog);
router.get("/student/:studentId", getStudentBehaviorLogs);
router.delete("/:id", deleteBehaviorLog);

module.exports = router;
