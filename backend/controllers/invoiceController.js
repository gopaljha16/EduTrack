const Invoice = require("../models/Invoice");
const Student = require("../models/Student");
const Payment = require("../models/Payment");
const ActivityLog = require("../models/ActivityLog");

/**
 * @desc    Get all invoices for a specific student
 * @route   GET /api/invoices/student/:studentId
 * @access  Private
 */
const getStudentInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ student: req.params.studentId }).sort({ dueDate: -1 });
    res.status(200).json({
      status: "success",
      count: invoices.length,
      invoices,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Generate a fee demand invoice for a student
 * @route   POST /api/invoices
 * @access  Private
 */
const generateInvoice = async (req, res, next) => {
  try {
    const { student, amount, month, dueDate } = req.body;

    if (!student || !amount || !month || !dueDate) {
      return res.status(400).json({
        status: "error",
        message: "Please fill in all required fields to generate an invoice.",
      });
    }

    // Generate unique invoice number: INV-YEAR-MONTH-RAND
    const yearPart = new Date(dueDate).getFullYear();
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${yearPart}-${month.slice(0,3).toUpperCase()}-${randPart}`;

    const invoice = await Invoice.create({
      student,
      invoiceNumber,
      amount,
      month,
      dueDate,
      status: "Pending",
    });

    const studentInfo = await Student.findById(student).select("name");
    if (studentInfo) {
      await ActivityLog.log(
        "Financial Ledger",
        `Generated billing invoice ${invoiceNumber} (${amount} INR) for ${studentInfo.name}`,
        req.user.name
      );
    }

    res.status(201).json({
      status: "success",
      message: "Invoice generated successfully.",
      invoice,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete invoice
 * @route   DELETE /api/invoices/:id
 * @access  Private
 */
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({ status: "error", message: "Invoice not found." });
    }

    res.status(200).json({
      status: "success",
      message: "Invoice removed successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudentInvoices,
  generateInvoice,
  deleteInvoice,
};
