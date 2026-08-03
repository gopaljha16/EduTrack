const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [1, "Age must be at least 1"],
      max: [100, "Age must be less than 100"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    studentClass: {
      type: String,
      required: [true, "Class is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Graduated"],
      default: "Active",
    },
    feeStatus: {
      type: String,
      enum: ["Paid", "Pending", "Overdue"],
      default: "Pending",
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    parentName: {
      type: String,
      trim: true,
    },
    parentPhone: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String, // Base64 data URI
    },
  },
  { timestamps: true }
);

// Auto-generate roll number if not provided
studentSchema.pre("save", async function () {
  if (this.rollNumber) return; // Skip if already set
  
  const year = new Date(this.admissionDate || Date.now()).getFullYear();
  const count = await mongoose.model("Student").countDocuments();
  const sequence = String(count + 1).padStart(3, "0");
  
  this.rollNumber = `EDU-${year}-${sequence}`;
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
