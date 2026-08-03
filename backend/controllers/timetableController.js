const Timetable = require("../models/Timetable");

/**
 * @desc    Add a period to the timetable
 * @route   POST /api/timetable
 * @access  Private
 */
const addSchedule = async (req, res, next) => {
  try {
    const { studentClass, day, subject, startTime, endTime, teacher, room } = req.body;

    if (!studentClass || !day || !subject || !startTime || !endTime) {
      return res.status(400).json({
        status: "error",
        message: "Please fill all required timetable fields.",
      });
    }

    const schedule = await Timetable.create({
      studentClass,
      day,
      subject,
      startTime,
      endTime,
      teacher,
      room,
    });

    res.status(201).json({
      status: "success",
      message: "Schedule added successfully.",
      schedule,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get timetable schedules for a specific class
 * @route   GET /api/timetable/:studentClass
 * @access  Private
 */
const getClassSchedules = async (req, res, next) => {
  try {
    const schedules = await Timetable.find({ studentClass: req.params.studentClass })
      .sort({ startTime: 1 });

    res.status(200).json({
      status: "success",
      count: schedules.length,
      schedules,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a timetable schedule entry
 * @route   DELETE /api/timetable/:id
 * @access  Private
 */
const deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Timetable.findByIdAndDelete(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        status: "error",
        message: "Schedule entry not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Schedule entry deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addSchedule,
  getClassSchedules,
  deleteSchedule,
};
