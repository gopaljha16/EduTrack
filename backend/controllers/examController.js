const Exam = require("../models/Exam");
const ActivityLog = require("../models/ActivityLog");

/**
 * @desc    Get all exam schedules
 * @route   GET /api/exams
 * @access  Private
 */
const getExams = async (req, res, next) => {
  try {
    const exams = await Exam.find().sort({ date: 1, startTime: 1 });
    res.status(200).json({
      status: "success",
      count: exams.length,
      exams,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get exam schedules for a specific class
 * @route   GET /api/exams/class/:className
 * @access  Private
 */
const getClassExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({ studentClass: req.params.className }).sort({ date: 1, startTime: 1 });
    res.status(200).json({
      status: "success",
      count: exams.length,
      exams,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create an exam schedule
 * @route   POST /api/exams
 * @access  Private
 */
const createExam = async (req, res, next) => {
  try {
    const exam = await Exam.create(req.body);
    await ActivityLog.log(
      "Exams",
      `Scheduled ${exam.examType} Exam for Class ${exam.studentClass}: ${exam.subject}`,
      req.user.name
    );

    res.status(201).json({
      status: "success",
      message: "Exam scheduled successfully.",
      exam,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update an exam schedule
 * @route   PUT /api/exams/:id
 * @access  Private
 */
const updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!exam) {
      return res.status(404).json({ status: "error", message: "Exam schedule not found." });
    }

    await ActivityLog.log("Exams", `Updated exam schedule for Class ${exam.studentClass}: ${exam.subject}`, req.user.name);

    res.status(200).json({
      status: "success",
      message: "Exam schedule updated successfully.",
      exam,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete an exam schedule
 * @route   DELETE /api/exams/:id
 * @access  Private
 */
const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({ status: "error", message: "Exam schedule not found." });
    }

    await ActivityLog.log("Exams", `Cancelled exam schedule for Class ${exam.studentClass}: ${exam.subject}`, req.user.name);

    res.status(200).json({
      status: "success",
      message: "Exam schedule deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getExams,
  getClassExams,
  createExam,
  updateExam,
  deleteExam,
};
