const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true, // One student can have one hostel allocation
    },
    hostelName: {
      type: String,
      required: [true, "Hostel/Dorm building name is required"],
      trim: true,
    },
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },
    bedNumber: {
      type: String,
      required: [true, "Bed designation is required"],
      trim: true,
    },
    monthlyRent: {
      type: Number,
      required: [true, "Monthly boarding rent charges are required"],
      min: 0,
    },
  },
  { timestamps: true }
);

const Hostel = mongoose.model("Hostel", hostelSchema);
module.exports = Hostel;
