const Student = require("../models/Student");
const ActivityLog = require("../models/ActivityLog");
const Attendance = require("../models/Attendance");

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
    await ActivityLog.log("Enrollment", `Enrolled a new student: ${student.name} (${student.studentClass})`, req.user.name);
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
    await ActivityLog.log("Update Profile", `Updated profile of student: ${student.name}`, req.user.name);
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
    await ActivityLog.log("Deletion", `Removed student record: ${student.name}`, req.user.name);
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

    // Fetch 5 most recent activity logs
    const recentLogs = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(5);

    // Aggregate class-wise attendance rates
    const attendanceStatsAgg = await Attendance.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      { $unwind: "$studentInfo" },
      {
        $group: {
          _id: "$studentInfo.studentClass",
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$status", "Present"] },
                    { $eq: ["$status", "Late"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const classAttendance = attendanceStatsAgg.map((c) => ({
      className: c._id,
      rate: c.total > 0 ? Math.round((c.present / c.total) * 100) : 100,
    })).sort((a, b) => b.rate - a.rate); // Sort by rate descending

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
        recentLogs,
        classAttendance,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk import students from CSV data array
 * @route   POST /api/students/import
 * @access  Private
 */
const importStudents = async (req, res, next) => {
  try {
    const { students } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Please provide an array of students to import.",
      });
    }

    // Insert many records
    const result = await Student.insertMany(students, { ordered: false });
    await ActivityLog.log("Import", `Bulk imported ${result.length} student records`, req.user.name);

    res.status(201).json({
      status: "success",
      message: `${result.length} students imported successfully.`,
      importedCount: result.length,
    });
  } catch (err) {
    // If some records fail (e.g. duplicate email), return partial success count if any were inserted
    if (err.name === "BulkWriteError" || err.code === 11000) {
      const insertedDocs = err.insertedDocs || [];
      return res.status(400).json({
        status: "error",
        message: `Import partially failed. Unique email constraints violated.`,
        importedCount: insertedDocs.length,
      });
    }
    next(err);
  }
};

/**
 * @desc    Promote students in a class to another class or graduate them
 * @route   PUT /api/students/promote
 * @access  Private
 */
const promoteClass = async (req, res, next) => {
  try {
    const { sourceClass, targetClass, action } = req.body; // action: 'promote' | 'graduate'

    if (!sourceClass || !action) {
      return res.status(400).json({
        status: "error",
        message: "Please specify a sourceClass and action (promote or graduate).",
      });
    }

    let result;
    if (action === "graduate") {
      result = await Student.updateMany(
        { studentClass: sourceClass, status: "Active" },
        { $set: { status: "Graduated" } }
      );
      await ActivityLog.log(
        "Graduation",
        `Graduated all active students in Class "${sourceClass}" (${result.modifiedCount} students)`,
        req.user.name
      );
    } else {
      if (!targetClass) {
        return res.status(400).json({
          status: "error",
          message: "Please specify a targetClass for promotion.",
        });
      }
      result = await Student.updateMany(
        { studentClass: sourceClass, status: "Active" },
        { $set: { studentClass: targetClass } }
      );
      await ActivityLog.log(
        "Promotion",
        `Promoted all active students from "${sourceClass}" to "${targetClass}" (${result.modifiedCount} students)`,
        req.user.name
      );
    }

    res.status(200).json({
      status: "success",
      message: `Successfully processed ${result.modifiedCount} students.`,
      modifiedCount: result.modifiedCount,
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
  importStudents,
  promoteClass,
};
