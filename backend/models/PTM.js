const mongoose = require("mongoose");

const ptmSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    dateTime: {
      type: Date,
      required: [true, "Meeting date and time is required"],
    },
    topic: {
      type: String,
      required: [true, "Meeting topic/agenda is required"],
      trim: true,
    },
    meetingLink: {
      type: String, // Optional virtual meeting link
      trim: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const PTM = mongoose.model("PTM", ptmSchema);
module.exports = PTM;
