const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/teacherController");

router.use(protect);

router.route("/").get(getTeachers).post(createTeacher);
router.route("/:id").put(updateTeacher).delete(deleteTeacher);

module.exports = router;
