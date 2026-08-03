const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getStudentMedical,
  updateMedical,
  recordClinicVisit,
  deleteClinicVisit,
} = require("../controllers/medicalController");

router.use(protect);

router.post("/", updateMedical);
router.post("/visit", recordClinicVisit);
router.get("/student/:studentId", getStudentMedical);
router.delete("/:studentId/visit/:visitId", deleteClinicVisit);

module.exports = router;
