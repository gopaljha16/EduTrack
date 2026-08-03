const Grade = require("../models/Grade");
const Student = require("../models/Student");
const ActivityLog = require("../models/ActivityLog");

/**
 * @desc    Add a grade/marks record for a student
 * @route   POST /api/grades
 * @access  Private
 */
const addGrade = async (req, res, next) => {
  try {
    const { student, subject, marksObtained, maxMarks, term, examDate, remarks } = req.body;

    if (!student || !subject || marksObtained === undefined || !maxMarks || !term) {
      return res.status(400).json({
        status: "error",
        message: "Please fill all required grade fields.",
      });
    }

    const grade = await Grade.create({
      student,
      subject,
      marksObtained,
      maxMarks,
      term,
      examDate,
      remarks,
    });

    // Log this action
    const studentInfo = await Student.findById(student).select("name");
    if (studentInfo) {
      await ActivityLog.log("Academics", `Logged ${subject} marks (${marksObtained}/${maxMarks}) for ${studentInfo.name}`, req.user.name);
    }

    res.status(201).json({
      status: "success",
      message: "Marks added successfully.",
      grade,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all grades/marks for a student
 * @route   GET /api/grades/student/:studentId
 * @access  Private
 */
const getStudentGrades = async (req, res, next) => {
  try {
    const grades = await Grade.find({ student: req.params.studentId }).sort({ examDate: -1 });

    // Calculate overall average GPA / Percentage
    let overallPercentage = 0;
    if (grades.length > 0) {
      const totals = grades.reduce(
        (acc, curr) => {
          acc.obtained += curr.marksObtained;
          acc.max += curr.maxMarks;
          return acc;
        },
        { obtained: 0, max: 0 }
      );
      overallPercentage = ((totals.obtained / totals.max) * 100).toFixed(1);
    }

    res.status(200).json({
      status: "success",
      count: grades.length,
      overallPercentage,
      grades,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a grade record
 * @route   PUT /api/grades/:id
 * @access  Private
 */
const updateGrade = async (req, res, next) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!grade) {
      return res.status(404).json({
        status: "error",
        message: "Grade record not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Marks updated successfully.",
      grade,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a grade record
 * @route   DELETE /api/grades/:id
 * @access  Private
 */
const deleteGrade = async (req, res, next) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);

    if (!grade) {
      return res.status(404).json({
        status: "error",
        message: "Grade record not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Marks record deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addGrade,
  getStudentGrades,
  updateGrade,
  deleteGrade,
};
