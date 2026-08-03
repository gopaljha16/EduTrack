const BehaviorLog = require("../models/BehaviorLog");
const Student = require("../models/Student");
const ActivityLog = require("../models/ActivityLog");

/**
 * @desc    Add a discipline/behavior log entry for a student
 * @route   POST /api/behavior
 * @access  Private
 */
const addBehaviorLog = async (req, res, next) => {
  try {
    const { student, category, points, details, date } = req.body;

    if (!student || !category || points === undefined || !details) {
      return res.status(400).json({
        status: "error",
        message: "Please fill all required behavior log fields.",
      });
    }

    const log = await BehaviorLog.create({
      student,
      category,
      points,
      details,
      date,
    });

    const studentInfo = await Student.findById(student).select("name");
    if (studentInfo) {
      await ActivityLog.log(
        "Behavioral Log",
        `Logged ${category} (${points > 0 ? "+" : ""}${points} pts) for ${studentInfo.name}`,
        req.user.name
      );
    }

    res.status(201).json({
      status: "success",
      message: "Behavioral entry recorded successfully.",
      log,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get behavior logs for a specific student
 * @route   GET /api/behavior/student/:studentId
 * @access  Private
 */
const getStudentBehaviorLogs = async (req, res, next) => {
  try {
    const logs = await BehaviorLog.find({ student: req.params.studentId }).sort({ date: -1 });

    const totalPoints = logs.reduce((acc, curr) => acc + curr.points, 0);

    res.status(200).json({
      status: "success",
      count: logs.length,
      totalPoints,
      logs,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a behavior log entry
 * @route   DELETE /api/behavior/:id
 * @access  Private
 */
const deleteBehaviorLog = async (req, res, next) => {
  try {
    const log = await BehaviorLog.findByIdAndDelete(req.params.id);

    if (!log) {
      return res.status(404).json({ status: "error", message: "Log entry not found." });
    }

    res.status(200).json({
      status: "success",
      message: "Log entry removed successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addBehaviorLog,
  getStudentBehaviorLogs,
  deleteBehaviorLog,
};
