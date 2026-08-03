const PTM = require("../models/PTM");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const ActivityLog = require("../models/ActivityLog");

/**
 * @desc    Schedule a parent-teacher meeting (PTM)
 * @route   POST /api/ptm
 * @access  Private
 */
const schedulePTM = async (req, res, next) => {
  try {
    const { student, teacher, dateTime, topic, meetingLink, remarks } = req.body;

    if (!student || !teacher || !dateTime || !topic) {
      return res.status(400).json({
        status: "error",
        message: "Please fill in all required PTM scheduling fields.",
      });
    }

    const meeting = await PTM.create({
      student,
      teacher,
      dateTime,
      topic,
      meetingLink,
      remarks,
    });

    const [studentInfo, teacherInfo] = await Promise.all([
      Student.findById(student).select("name"),
      Teacher.findById(teacher).select("name"),
    ]);

    if (studentInfo && teacherInfo) {
      await ActivityLog.log(
        "PTM Scheduler",
        `Scheduled PTM for ${studentInfo.name} with Mr./Ms. ${teacherInfo.name} on ${new Date(dateTime).toLocaleDateString()}`,
        req.user.name
      );
    }

    res.status(201).json({
      status: "success",
      message: "Parent-Teacher meeting scheduled successfully.",
      meeting,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get PTM schedules for a specific student
 * @route   GET /api/ptm/student/:studentId
 * @access  Private
 */
const getStudentPTMs = async (req, res, next) => {
  try {
    const meetings = await PTM.find({ student: req.params.studentId })
      .populate("teacher", "name specialization")
      .sort({ dateTime: 1 });

    res.status(200).json({
      status: "success",
      count: meetings.length,
      meetings,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update PTM details or status (e.g. Completed, Cancelled)
 * @route   PUT /api/ptm/:id
 * @access  Private
 */
const updatePTM = async (req, res, next) => {
  try {
    const meeting = await PTM.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("teacher", "name");

    if (!meeting) {
      return res.status(404).json({ status: "error", message: "Meeting slot not found." });
    }

    res.status(200).json({
      status: "success",
      message: "PTM meeting status updated successfully.",
      meeting,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete PTM schedule entry
 * @route   DELETE /api/ptm/:id
 * @access  Private
 */
const deletePTM = async (req, res, next) => {
  try {
    const meeting = await PTM.findByIdAndDelete(req.params.id);

    if (!meeting) {
      return res.status(404).json({ status: "error", message: "Meeting entry not found." });
    }

    res.status(200).json({
      status: "success",
      message: "PTM schedule deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  schedulePTM,
  getStudentPTMs,
  updatePTM,
  deletePTM,
};
