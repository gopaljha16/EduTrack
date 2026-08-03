const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addPayment,
  getStudentPayments,
  deletePayment,
} = require("../controllers/paymentController");

router.use(protect);

router.post("/", addPayment);
router.get("/student/:studentId", getStudentPayments);
router.delete("/:id", deletePayment);

module.exports = router;
