const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  schedulePTM,
  getStudentPTMs,
  updatePTM,
  deletePTM,
} = require("../controllers/ptmController");

router.use(protect);

router.post("/", schedulePTM);
router.get("/student/:studentId", getStudentPTMs);
router.route("/:id").put(updatePTM).delete(deletePTM);

module.exports = router;
