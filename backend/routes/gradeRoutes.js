const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addGrade,
  getStudentGrades,
  updateGrade,
  deleteGrade,
} = require("../controllers/gradeController");

router.use(protect);

router.post("/", addGrade);
router.get("/student/:studentId", getStudentGrades);
router.route("/:id").put(updateGrade).delete(deleteGrade);

module.exports = router;
