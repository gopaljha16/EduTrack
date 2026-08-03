const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    marksObtained: {
      type: Number,
      required: [true, "Marks obtained is required"],
      min: 0,
    },
    maxMarks: {
      type: Number,
      required: [true, "Maximum marks is required"],
      default: 100,
      min: 1,
    },
    term: {
      type: String,
      required: [true, "Exam term is required (e.g., Midterm, Final, Unit Test)"],
      trim: true,
    },
    examDate: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Virtual property to calculate percentage
gradeSchema.virtual("percentage").get(function () {
  return ((this.marksObtained / this.maxMarks) * 100).toFixed(1);
});

// Virtual property to calculate letter grade
gradeSchema.virtual("letterGrade").get(function () {
  const pct = (this.marksObtained / this.maxMarks) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
});

// Ensure virtuals are included in JSON/Object conversions
gradeSchema.set("toJSON", { virtuals: true });
gradeSchema.set("toObject", { virtuals: true });

const Grade = mongoose.model("Grade", gradeSchema);
module.exports = Grade;
