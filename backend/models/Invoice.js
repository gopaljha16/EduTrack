const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    invoiceNumber: {
      type: String, // e.g. "INV-2026-08-001"
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: [true, "Invoice billing amount is required"],
      min: 0,
    },
    month: {
      type: String, // e.g. "August 2026"
      required: [true, "Billing cycle month is required"],
    },
    dueDate: {
      type: Date,
      required: [true, "Payment due date is required"],
    },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Overdue"],
      default: "Pending",
    },
    paymentReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
