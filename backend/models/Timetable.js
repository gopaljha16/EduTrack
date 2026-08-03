const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    studentClass: {
      type: String,
      required: [true, "Class is required"],
      trim: true,
    },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: [true, "Day of the week is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, "Start time is required (e.g. 09:00)"],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, "End time is required (e.g. 10:00)"],
      trim: true,
    },
    teacher: {
      type: String,
      trim: true,
    },
    room: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent overlapping schedules for the same class, day and start time
timetableSchema.index({ studentClass: 1, day: 1, startTime: 1 }, { unique: true });

const Timetable = mongoose.model("Timetable", timetableSchema);
module.exports = Timetable;
