const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getStudentHostel,
  allocateHostel,
  deleteHostel,
} = require("../controllers/hostelController");

router.use(protect);

router.post("/", allocateHostel);
router.route("/student/:studentId").get(getStudentHostel).delete(deleteHostel);

module.exports = router;
