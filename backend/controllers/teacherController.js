const Teacher = require("../models/Teacher");
const ActivityLog = require("../models/ActivityLog");

/**
 * @desc    Get all teachers
 * @route   GET /api/teachers
 * @access  Private
 */
const getTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find().sort({ name: 1 });
    res.status(200).json({
      status: "success",
      count: teachers.length,
      teachers,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a teacher record
 * @route   POST /api/teachers
 * @access  Private
 */
const createTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.create(req.body);
    await ActivityLog.log("Teacher Management", `Added teacher record: ${teacher.name} (${teacher.specialization})`, req.user.name);

    res.status(201).json({
      status: "success",
      message: "Teacher added successfully.",
      teacher,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a teacher record
 * @route   PUT /api/teachers/:id
 * @access  Private
 */
const updateTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!teacher) {
      return res.status(404).json({ status: "error", message: "Teacher not found." });
    }

    await ActivityLog.log("Teacher Management", `Updated teacher record: ${teacher.name}`, req.user.name);

    res.status(200).json({
      status: "success",
      message: "Teacher updated successfully.",
      teacher,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a teacher record
 * @route   DELETE /api/teachers/:id
 * @access  Private
 */
const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!teacher) {
      return res.status(404).json({ status: "error", message: "Teacher not found." });
    }

    await ActivityLog.log("Teacher Management", `Removed teacher record: ${teacher.name}`, req.user.name);

    res.status(200).json({
      status: "success",
      message: "Teacher deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
