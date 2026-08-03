const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    studentClass: {
      type: String,
      required: [true, "Class is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    examType: {
      type: String,
      enum: ["Midterm", "Final", "Class Test", "Practical"],
      required: [true, "Exam type is required"],
    },
    date: {
      type: Date,
      required: [true, "Exam date is required"],
    },
    startTime: {
      type: String, // e.g. "09:00 AM"
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String, // e.g. "12:00 PM"
      required: [true, "End time is required"],
    },
    room: {
      type: String, // Room allocation
      required: [true, "Room allocation is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

const Exam = mongoose.model("Exam", examSchema);
module.exports = Exam;
