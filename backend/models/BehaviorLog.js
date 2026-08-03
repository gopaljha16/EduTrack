const mongoose = require("mongoose");

const behaviorLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    category: {
      type: String,
      enum: ["Commendation", "Warning", "Suspension"],
      required: true,
    },
    points: {
      type: Number,
      required: true,
      default: 0, // e.g. +10 for commendation, -5 for warning
    },
    details: {
      type: String,
      required: [true, "Details/remarks are required"],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const BehaviorLog = mongoose.model("BehaviorLog", behaviorLogSchema);
module.exports = BehaviorLog;
