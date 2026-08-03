const Student = require("../models/Student");

/**
 * @desc    Get all students (with optional search + filter)
 * @route   GET /api/students
 * @access  Private
 */
const getStudents = async (req, res, next) => {
  try {
    const { search, studentClass, status, feeStatus } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
      ];
    }
    if (studentClass) query.studentClass = studentClass;
    if (status) query.status = status;
    if (feeStatus) query.feeStatus = feeStatus;

    const students = await Student.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      count: students.length,
      student: students,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single student by ID
 * @route   GET /api/students/:id
 * @access  Private
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ status: "error", message: "Student not found." });
    }
    res.status(200).json({ status: "success", student });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new student
 * @route   POST /api/students
 * @access  Private
 */
const createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({
      status: "success",
      message: "Student enrolled successfully.",
      student,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a student
 * @route   PUT /api/students/:id
 * @access  Private
 */
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ status: "error", message: "Student not found." });
    }
    res.status(200).json({
      status: "success",
      message: "Student updated successfully.",
      student,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a student
 * @route   DELETE /api/students/:id
 * @access  Private
 */
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ status: "error", message: "Student not found." });
    }
    res.status(200).json({
      status: "success",
      message: "Student deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/students/stats
 * @access  Private
 */
const getStats = async (req, res, next) => {
  try {
    const [
      total,
      active,
      inactive,
      graduated,
      feePaid,
      feePending,
      feeOverdue,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: "Active" }),
      Student.countDocuments({ status: "Inactive" }),
      Student.countDocuments({ status: "Graduated" }),
      Student.countDocuments({ feeStatus: "Paid" }),
      Student.countDocuments({ feeStatus: "Pending" }),
      Student.countDocuments({ feeStatus: "Overdue" }),
    ]);

    // Average age
    const ageAgg = await Student.aggregate([
      { $group: { _id: null, avgAge: { $avg: "$age" } } },
    ]);
    const avgAge = ageAgg.length ? ageAgg[0].avgAge.toFixed(1) : 0;

    // Unique classes
    const classes = await Student.distinct("studentClass");

    // Recent 5 students
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name studentClass status feeStatus createdAt");

    // Students per class
    const classDistribution = await Student.aggregate([
      { $group: { _id: "$studentClass", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      status: "success",
      stats: {
        total,
        active,
        inactive,
        graduated,
        avgAge,
        totalClasses: classes.length,
        fee: { paid: feePaid, pending: feePending, overdue: feeOverdue },
        recentStudents,
        classDistribution,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStats,
};
