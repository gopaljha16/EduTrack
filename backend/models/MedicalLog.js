const mongoose = require("mongoose");

const clinicVisitSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  reason: {
    type: String,
    required: [true, "Reason for visit is required"],
    trim: true,
  },
  treatment: {
    type: String,
    required: [true, "Treatment/Action taken is required"],
    trim: true,
  },
});

const medicalLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true, // One medical record dossier per student
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    allergies: {
      type: String,
      trim: true,
      default: "None reported",
    },
    medications: {
      type: String,
      trim: true,
      default: "None",
    },
    clinicVisits: [clinicVisitSchema],
  },
  { timestamps: true }
);

const MedicalLog = mongoose.model("MedicalLog", medicalLogSchema);
module.exports = MedicalLog;
