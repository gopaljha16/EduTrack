const Payment = require("../models/Payment");
const Student = require("../models/Student");

/**
 * @desc    Record a fee payment for a student
 * @route   POST /api/payments
 * @access  Private
 */
const addPayment = async (req, res, next) => {
  try {
    const { student, amount, paymentDate, paymentMethod, referenceNumber, remarks } = req.body;

    if (!student || !amount || !paymentMethod) {
      return res.status(400).json({
        status: "error",
        message: "Please provide student, amount and paymentMethod.",
      });
    }

    const payment = await Payment.create({
      student,
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      remarks,
    });

    // Optionally auto-update Student's fee status to Paid
    // For simplicity, we can set it to Paid if a payment is made,
    // or let the admin adjust status on Student detail page.
    await Student.findByIdAndUpdate(student, { feeStatus: "Paid" });

    res.status(201).json({
      status: "success",
      message: "Payment recorded successfully. Fee status updated to Paid.",
      payment,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get payment history for a single student
 * @route   GET /api/payments/student/:studentId
 * @access  Private
 */
const getStudentPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ student: req.params.studentId }).sort({ paymentDate: -1 });

    const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);

    res.status(200).json({
      status: "success",
      count: payments.length,
      totalPaid,
      payments,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a payment record
 * @route   DELETE /api/payments/:id
 * @access  Private
 */
const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({
        status: "error",
        message: "Payment record not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Payment record removed successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addPayment,
  getStudentPayments,
  deletePayment,
};
