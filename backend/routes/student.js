const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStats,
  importStudents,
  promoteClass,
} = require("../controllers/studentController");

// All routes below require authentication
router.use(protect);

router.get("/stats", getStats);
router.post("/import", importStudents);
router.put("/promote", promoteClass);
router.route("/").get(getStudents).post(createStudent);
router.route("/:id").get(getStudentById).put(updateStudent).delete(deleteStudent);

module.exports = router;
