const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getStudentInvoices,
  generateInvoice,
  deleteInvoice,
} = require("../controllers/invoiceController");

router.use(protect);

router.post("/", generateInvoice);
router.get("/student/:studentId", getStudentInvoices);
router.delete("/:id", deleteInvoice);

module.exports = router;
