const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true, // One student can have one bus transport allocation
    },
    routeName: {
      type: String, // e.g. "North Route Route 1"
      required: [true, "Route name is required"],
      trim: true,
    },
    busNumber: {
      type: String, // e.g. "DL-01-A-1234"
      required: [true, "Bus registration number is required"],
      trim: true,
    },
    driverName: {
      type: String,
      required: [true, "Driver name is required"],
      trim: true,
    },
    driverPhone: {
      type: String,
      required: [true, "Driver phone number is required"],
      trim: true,
    },
    monthlyFare: {
      type: Number,
      required: [true, "Monthly bus transport fare is required"],
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

const Transport = mongoose.model("Transport", transportSchema);
module.exports = Transport;
