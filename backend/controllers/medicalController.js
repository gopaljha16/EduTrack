const MedicalLog = require("../models/MedicalLog");
const Student = require("../models/Student");
const ActivityLog = require("../models/ActivityLog");

/**
 * @desc    Get medical record dossier for a student
 * @route   GET /api/medical/student/:studentId
 * @access  Private
 */
const getStudentMedical = async (req, res, next) => {
  try {
    let medical = await MedicalLog.findOne({ student: req.params.studentId });

    // Auto-create blank dossier profile if not exists
    if (!medical) {
      medical = await MedicalLog.create({
        student: req.params.studentId,
        bloodGroup: "",
        allergies: "None reported",
        medications: "None",
        clinicVisits: [],
      });
    }

    res.status(200).json({
      status: "success",
      medical,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update medical parameters (blood group, allergies, medications)
 * @route   POST /api/medical
 * @access  Private
 */
const updateMedical = async (req, res, next) => {
  try {
    const { student, bloodGroup, allergies, medications } = req.body;

    if (!student) {
      return res.status(400).json({ status: "error", message: "Student ID is required." });
    }

    let medical = await MedicalLog.findOne({ student });
    if (!medical) {
      medical = new MedicalLog({ student });
    }

    medical.bloodGroup = bloodGroup || medical.bloodGroup;
    medical.allergies = allergies !== undefined ? allergies : medical.allergies;
    medical.medications = medications !== undefined ? medications : medical.medications;
    await medical.save();

    const studentInfo = await Student.findById(student).select("name");
    if (studentInfo) {
      await ActivityLog.log(
        "Health",
        `Updated clinic medical dossier records for ${studentInfo.name}`,
        req.user.name
      );
    }

    res.status(200).json({
      status: "success",
      message: "Medical dossier updated successfully.",
      medical,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Record a new clinic visit log
 * @route   POST /api/medical/visit
 * @access  Private
 */
const recordClinicVisit = async (req, res, next) => {
  try {
    const { student, reason, treatment } = req.body;

    if (!student || !reason || !treatment) {
      return res.status(400).json({
        status: "error",
        message: "Please fill in clinic check-in reason and treatment actions.",
      });
    }

    let medical = await MedicalLog.findOne({ student });
    if (!medical) {
      medical = await MedicalLog.create({
        student,
        clinicVisits: [],
      });
    }

    medical.clinicVisits.unshift({
      date: new Date(),
      reason,
      treatment,
    });
    await medical.save();

    const studentInfo = await Student.findById(student).select("name");
    if (studentInfo) {
      await ActivityLog.log(
        "Health",
        `Logged clinic visit ("${reason}") for ${studentInfo.name}`,
        req.user.name
      );
    }

    res.status(201).json({
      status: "success",
      message: "Clinic visit logged successfully.",
      medical,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove check-in log
 * @route   DELETE /api/medical/:studentId/visit/:visitId
 * @access  Private
 */
const deleteClinicVisit = async (req, res, next) => {
  try {
    const medical = await MedicalLog.findOne({ student: req.params.studentId });

    if (!medical) {
      return res.status(404).json({ status: "error", message: "Medical dossier not found." });
    }

    medical.clinicVisits = medical.clinicVisits.filter(
      (v) => v._id.toString() !== req.params.visitId
    );
    await medical.save();

    res.status(200).json({
      status: "success",
      message: "Clinic visit log entry removed.",
      medical,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudentMedical,
  updateMedical,
  recordClinicVisit,
  deleteClinicVisit,
};
