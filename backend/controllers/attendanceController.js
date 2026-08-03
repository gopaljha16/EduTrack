const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

/**
 * @desc    Mark attendance for multiple students
 * @route   POST /api/attendance
 * @access  Private
 */
const markAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body; // records: [{ student: ObjectId, status: "Present"|"Absent"|"Late", remarks: "" }]

    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a date and records array.",
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0); // Normalize to start of day

    const bulkOps = records.map((rec) => ({
      updateOne: {
        filter: { student: rec.student, date: attendanceDate },
        update: {
          $set: {
            status: rec.status,
            remarks: rec.remarks || "",
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(bulkOps);

    res.status(200).json({
      status: "success",
      message: "Attendance marked successfully.",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get attendance records for a class on a specific date
 * @route   GET /api/attendance/class
 * @access  Private
 */
const getClassAttendance = async (req, res, next) => {
  try {
    const { date, studentClass } = req.query;

    if (!date || !studentClass) {
      return res.status(400).json({
        status: "error",
        message: "Please provide both date and studentClass.",
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Get all students in that class
    const students = await Student.find({ studentClass, status: "Active" }).select("name rollNumber");

    // Get existing attendance records for these students on that date
    const studentIds = students.map((s) => s._id);
    const attendanceRecords = await Attendance.find({
      student: { $in: studentIds },
      date: attendanceDate,
    });

    const attendanceMap = new Map(
      attendanceRecords.map((rec) => [rec.student.toString(), rec])
    );

    const result = students.map((s) => {
      const record = attendanceMap.get(s._id.toString());
      return {
        student: s,
        status: record ? record.status : "",
        remarks: record ? record.remarks : "",
      };
    });

    res.status(200).json({
      status: "success",
      date: attendanceDate,
      attendance: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get attendance history for a single student
 * @route   GET /api/attendance/student/:studentId
 * @access  Private
 */
const getStudentAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId })
      .sort({ date: -1 })
      .limit(100);

    const total = records.length;
    const present = records.filter((r) => r.status === "Present").length;
    const late = records.filter((r) => r.status === "Late").length;
    const absent = records.filter((r) => r.status === "Absent").length;

    const rate = total > 0 ? (((present + late * 0.5) / total) * 100).toFixed(1) : "100.0";

    res.status(200).json({
      status: "success",
      stats: { total, present, late, absent, rate },
      records,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  markAttendance,
  getClassAttendance,
  getStudentAttendance,
};
