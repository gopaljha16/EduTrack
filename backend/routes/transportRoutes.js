const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getStudentTransport,
  allocateTransport,
  deleteTransport,
} = require("../controllers/transportController");

router.use(protect);

router.post("/", allocateTransport);
router.route("/student/:studentId").get(getStudentTransport).delete(deleteTransport);

module.exports = router;
